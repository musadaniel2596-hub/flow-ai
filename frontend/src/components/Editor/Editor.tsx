"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
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

export default function Editor({
  code,
  language,
  errors,
  onChange,
  onCursorChange,
}: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [hoveredError, setHoveredError] = useState<CodeError | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const lines = useMemo(() => code.split("\n"), [code]);
  const totalLines = lines.length;

  // Sync scroll between textarea and all other layers
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

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.addEventListener("scroll", syncScroll);
    // Initial sync
    syncScroll();
    return () => ta.removeEventListener("scroll", syncScroll);
  }, [syncScroll]);

  // Update cursor position and notify parent
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

  // Handle keyboard events (Tab, etc.)
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

        // Use requestAnimationFrame to ensure React has rendered the new value
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
          updateCursor();
        });
      }
    },
    [onChange, updateCursor]
  );

  // Build highlighted HTML
  const highlightedHTML = useMemo(() => {
    const highlightedLines = lines.map((line) =>
      highlightSyntax(line || " ", language)
    );
    const withErrors = applyErrorHighlights(highlightedLines, errors);
    // Add a trailing newline to ensure scrolling matches if user adds many newlines
    return withErrors.join("\n") + "\n\n";
  }, [lines, language, errors]);

  // Current line error for status bar
  const currentLineError = useMemo(() =>
    getLineError(cursorPos.line, errors),
  [cursorPos.line, errors]);

  // Error markers for the gutter/overlay
  const markers = useMemo(() => {
    // Note: Accurate pixel-perfect markers are hard with variable width fonts
    // but since we use JetBrains Mono (monospaced), we can estimate.
    return errors
      .filter((e) => e.line > 0 && e.line <= totalLines)
      .map((e) => ({
        id: `m-${e.line}-${e.col || 0}`,
        line: e.line,
        severity: e.severity,
      }));
  }, [errors, totalLines]);

  return (
    <div className="flex flex-col h-full border border-white/5 rounded-xl overflow-hidden bg-bg-editor">
      <div className="flex flex-1 min-h-0 relative">
        {/* Line numbers column */}
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

        {/* Editor body */}
        <div className="relative flex-1 min-w-0 editor-container group">
          {/* Syntax layer */}
          <div
            ref={highlightRef}
            className="editor-layer font-mono text-sm text-text-primary"
            dangerouslySetInnerHTML={{ __html: highlightedHTML }}
          />

          {/* Overlay for decorations (like red underlines or dots) */}
          <div ref={overlayRef} className="editor-layer overflow-hidden">
            {/* You could add custom underline decorations here if needed */}
          </div>

          {/* Interaction layer (Textarea) */}
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

      {/* Editor Status Bar */}
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
}
