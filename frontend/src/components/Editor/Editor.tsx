"use client";

import { useRef, useEffect, useCallback, useState } from "react";
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
  const [markers, setMarkers] = useState<
    { id: string; left: number; top: number; severity: CodeError['severity'] }[]
  >([]);

  const lines = code.split("\n");
  const totalLines = lines.length;

  // Sync scroll between textarea and highlight layer
  const syncScroll = useCallback(() => {
    if (!textareaRef.current || !highlightRef.current || !lineNumbersRef.current) return;
    const { scrollTop, scrollLeft } = textareaRef.current;
    highlightRef.current.scrollTop = scrollTop;
    highlightRef.current.scrollLeft = scrollLeft;
    if (overlayRef.current) {
      overlayRef.current.scrollTop = scrollTop;
      overlayRef.current.scrollLeft = scrollLeft;
    }
    lineNumbersRef.current.scrollTop = scrollTop;
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.addEventListener("scroll", syncScroll);
    return () => ta.removeEventListener("scroll", syncScroll);
  }, [syncScroll]);

  // Update cursor position
  const updateCursor = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const textBefore = ta.value.substring(0, pos);
    const linesBefore = textBefore.split("\n");
    const line = linesBefore.length;
    const col = linesBefore[linesBefore.length - 1].length + 1;
    onCursorChange(line, col);
  }, [onCursorChange]);

  // Handle tab key
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
        // Restore cursor position after React update
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        }, 0);
      }
    },
    [onChange]
  );

  // Build highlighted HTML
  const getHighlightedHTML = useCallback(() => {
    const highlightedLines = lines.map((line) =>
      highlightSyntax(line, language)
    );

    const withErrors = applyErrorHighlights(highlightedLines, errors);
    return withErrors.join("\n") + "\n"; // Extra newline for proper height
  }, [lines, language, errors]);

  // Compute column markers when code or errors change
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) {
      setMarkers([]);
      return;
    }

    const cs = window.getComputedStyle(ta);
    const fontSize = cs.fontSize || "14px";
    const fontFamily = cs.fontFamily || "monospace";
    const lineHeight = parseFloat(cs.lineHeight) || 22.4;
    const padLeft = 16; // keep in sync with inline styles
    const padTop = 16;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = `${fontSize} ${fontFamily}`;
    const charWidth = ctx.measureText("0").width || 8;

    const newMarkers = errors
      .filter((e) => typeof e.col === "number" && e.col! > 0 && e.line > 0)
      .map((e) => ({
        id: `m-${e.line}-${e.col}`,
        left: padLeft + (e.col! - 1) * charWidth,
        top: padTop + (e.line - 1) * lineHeight,
        severity: e.severity,
      }));

    setMarkers(newMarkers);
  }, [errors, code]);

  // Handle line hover for error tooltip
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!lineNumbersRef.current || errors.length === 0) return;

      const lineHeight = 22.4; // 14px font * 1.6 line-height
      const rect = lineNumbersRef.current.getBoundingClientRect();
      const scrollTop = textareaRef.current?.scrollTop || 0;
      const relY = e.clientY - rect.top + scrollTop;
      const lineNum = Math.floor(relY / lineHeight) + 1;

      const err = getLineError(lineNum, errors);
      setHoveredError(err || null);
      if (err) {
        setTooltipPos({ x: e.clientX + 10, y: e.clientY - 10 });
      }
    },
    [errors]
  );

  return (
    <div className="relative flex h-full min-h-0">
      {/* Line numbers column */}
      <div
        ref={lineNumbersRef}
        className="flex-none w-12 md:w-14 overflow-hidden select-none border-r border-white/5 bg-bg-editor"
        style={{ scrollbarWidth: "none" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredError(null)}
      >
        <div className="py-4">
          {Array.from({ length: totalLines }, (_, i) => {
            const lineNum = i + 1;
            const lineError = getLineError(lineNum, errors);
            return (
              <div
                key={lineNum}
                className={`flex items-center justify-end pr-2 md:pr-3 font-mono text-xs
                  ${
                    lineError
                      ? lineError.severity === "error"
                        ? "text-error-red"
                        : lineError.severity === "warning"
                        ? "text-warning"
                        : "text-accent-cyan"
                      : "text-text-muted/40"
                  }`}
                style={{ height: "22.4px", lineHeight: "22.4px" }}
              >
                {lineError ? (
                  <span
                    className={`mr-1 text-xs ${
                      lineError.severity === "error"
                        ? "text-error-red"
                        : "text-warning"
                    }`}
                  >
                    ●
                  </span>
                ) : null}
                {lineNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor body */}
      <div className="relative flex-1 min-w-0 overflow-hidden editor-container bg-bg-editor">
        {/* Syntax highlight layer (behind textarea) */}
        <div
          ref={highlightRef}
          className="editor-highlight absolute inset-0 font-mono text-sm pointer-events-none"
          style={{
            fontSize: 14,
            lineHeight: "22.4px",
            overflowX: "auto",
            overflowY: "hidden",
            paddingTop: 16,
            paddingBottom: 16,
            paddingLeft: 16,
            paddingRight: 16,
          }}
          dangerouslySetInnerHTML={{ __html: getHighlightedHTML() }}
        />

        {/* Actual textarea (invisible text, visible caret) */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCursor}
          onClick={updateCursor}
          onSelect={updateCursor}
          className="editor-textarea font-mono text-sm editor-scroll"
          style={{
            fontSize: 14,
            lineHeight: "22.4px",
            paddingTop: 16,
            paddingBottom: 16,
            paddingLeft: 16,
            paddingRight: 16,
          }}
          placeholder="// Paste your code here, or upload a screenshot below..."
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          aria-label="Code editor"
        />

        {/* Column markers overlay (above highlight, pointer-events none) */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            fontSize: 14,
            lineHeight: "22.4px",
            overflowX: "auto",
            overflowY: "hidden",
            paddingTop: 16,
            paddingBottom: 16,
            paddingLeft: 16,
            paddingRight: 16,
            zIndex: 3,
          }}
        >
          {markers.map((m) => (
            <div
              key={m.id}
              style={{
                position: "absolute",
                left: m.left,
                top: m.top + 8,
                width: 8,
                height: 8,
                borderRadius: 9999,
                background:
                  m.severity === "error" ? "#ef4444" : "#f59e0b",
                boxShadow: "0 0 6px rgba(0,0,0,0.4)",
                transform: "translateY(-50%)",
              }}
            />
          ))}
        </div>

        {/* Empty state hint */}
        {!code && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-text-muted/30 select-none">
              <svg
                className="mx-auto mb-3 opacity-30"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <p className="font-mono text-sm">Start typing or paste code</p>
            </div>
          </div>
        )}
      </div>

      {/* Error tooltip */}
      {hoveredError && (
        <div
          className="fixed z-50 max-w-xs p-3 rounded-lg bg-bg-card border border-error-red/20
                       shadow-xl shadow-black/50 pointer-events-none animate-fade-in"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <p className="text-xs font-medium text-error-red mb-1">
            {hoveredError.severity === "error"
              ? "Error"
              : hoveredError.severity === "warning"
              ? "Warning"
              : "Info"}{" "}
            — Line {hoveredError.line}
          </p>
          <p className="text-xs text-text-secondary">{hoveredError.message}</p>
          <p className="text-xs text-accent-cyan mt-1">
            Fix: {hoveredError.fix}
          </p>
        </div>
      )}
    </div>
  );
}
