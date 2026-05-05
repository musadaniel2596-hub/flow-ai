"use client";

import { useRef, useEffect, useCallback, useState, useMemo, useImperativeHandle, forwardRef } from "react";
import { CodeError } from "@/types";
import { highlightSyntax } from "@/lib/syntaxColors";
import { applyErrorHighlights, getLineError } from "@/lib/highlightErrors";

interface EditorProps {
  code: string;
  language: string;
  errors: CodeError[];
  onChange: (code: string) => void;
  onCursorChange: (line: number, col: number) => void;
}

export interface EditorHandle {
  scrollToLine: (line: number) => void;
  focus: () => void;
}

const Editor = forwardRef<EditorHandle, EditorProps>(({
  code,
  language,
  errors,
  onChange,
  onCursorChange,
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const lines = useMemo(() => code.split("\n"), [code]);
  const totalLines = lines.length;

  const syncScroll = useCallback(() => {
    if (!textareaRef.current) return;
    const { scrollTop, scrollLeft } = textareaRef.current;

    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
    if (overlayRef.current) {
      overlayRef.current.scrollTop = scrollTop;
      overlayRef.current.scrollLeft = scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  }, []);

  // Exposed methods for parent
  useImperativeHandle(ref, () => ({
    scrollToLine: (line: number) => {
      if (!textareaRef.current) return;
      const lineHeight = 22.4; // Matches CSS
      const targetScroll = (line - 1) * lineHeight;

      textareaRef.current.scrollTo({
        top: Math.max(0, targetScroll - 44), // Offset a bit to show context
        behavior: "smooth"
      });

      // Move cursor to that line
      const textLines = code.split("\n");
      let charPos = 0;
      for (let i = 0; i < Math.min(line - 1, textLines.length); i++) {
        charPos += textLines[i].length + 1;
      }

      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(charPos, charPos);
      updateCursor();
    },
    focus: () => textareaRef.current?.focus(),
  }));

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.addEventListener("scroll", syncScroll);
    syncScroll();
    return () => ta.removeEventListener("scroll", syncScroll);
  }, [syncScroll, code]);

  const updateCursor = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const textBefore = ta.value.substring(0, pos);
    const linesBefore = textBefore.split("\n");
    const line = linesBefore.length;
    const col = linesBefore[linesBefore.length - 1].length + 1;

    setCursorPos({ line, col });
    onCursorChange(line, col);
  }, [onCursorChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newValue =
          ta.value.substring(0, start) + "  " + ta.value.substring(end);
        onChange(newValue);

        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
          updateCursor();
        });
      }
    },
    [onChange, updateCursor]
  );

  const highlightedHTML = useMemo(() => {
    const highlightedLines = lines.map((line) =>
      highlightSyntax(line || " ", language)
    );
    const withErrors = applyErrorHighlights(highlightedLines, errors);
    return withErrors.join("\n") + "\n\n";
  }, [lines, language, errors]);

  const currentLineError = useMemo(() =>
    getLineError(cursorPos.line, errors),
  [cursorPos.line, errors]);

  return (
    <div className="flex flex-col h-full border border-white/5 rounded-xl overflow-hidden bg-bg-editor">
      <div className="flex flex-1 min-h-0 relative">
        <div
          ref={lineNumbersRef}
          className="flex-none w-12 md:w-14 overflow-hidden select-none border-r border-white/5 bg-bg-editor/50"
        >
          <div className="py-4">
            {Array.from({ length: totalLines }, (_, i) => {
              const lineNum = i + 1;
              const lineError = getLineError(lineNum, errors);
              const isCurrentLine = cursorPos.line === lineNum;

              return (
                <div
                  key={lineNum}
                  className={`flex items-center justify-end pr-3 font-mono text-[11px] transition-colors
                    ${isCurrentLine ? "bg-white/5 text-text-primary" : "text-text-muted/30"}
                    ${lineError ? (lineError.severity === "error" ? "text-error-red/80" : "text-warning-orange/80") : ""}`}
                  style={{ height: "22.4px" }}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex-1 min-w-0 editor-container group">
          <div
            ref={highlightRef}
            className="editor-layer font-mono text-sm text-text-primary"
            dangerouslySetInnerHTML={{ __html: highlightedHTML }}
          />

          <div ref={overlayRef} className="editor-layer overflow-hidden" />

          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={updateCursor}
            onClick={updateCursor}
            onSelect={updateCursor}
            className="editor-textarea editor-scroll"
            placeholder="// Paste your code or upload a screenshot..."
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex-none h-8 px-4 flex items-center justify-between border-t border-white/5 bg-bg-secondary/80 text-[11px] font-mono select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Ln</span>
            <span className="text-accent-cyan">{cursorPos.line}</span>
            <span className="text-text-muted ml-1">Col</span>
            <span className="text-accent-cyan">{cursorPos.col}</span>
          </div>

          {currentLineError && (
            <div className={`flex items-center gap-2 animate-fade-in
              ${currentLineError.severity === "error" ? "text-error-red" : "text-warning-orange"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="truncate max-w-[300px] md:max-w-md">
                {currentLineError.message}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-text-muted">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${errors.length > 0 ? (errors.some(e => e.severity === 'error') ? 'bg-error-red' : 'bg-warning-orange') : 'bg-emerald-500'}`} />
            <span>{errors.length} {errors.length === 1 ? 'issue' : 'issues'}</span>
          </div>
          <span className="uppercase">{language}</span>
        </div>
      </div>
    </div>
  );
});

Editor.displayName = "Editor";
export default Editor;
