"use client";

import { useState, useCallback } from "react";
import { highlightSyntax } from "@/lib/syntaxColors";

interface FixPanelProps {
  fixedCode: string;
  language: string;
  isVisible: boolean;
  onUseCode: (code: string) => void;
}

export default function FixPanel({
  fixedCode,
  language,
  isVisible,
  onUseCode,
}: FixPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = fixedCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [fixedCode]);

  if (!isVisible || !fixedCode) return null;

  const lines = fixedCode.split("\n");

  // Build highlighted HTML for fixed code
  const highlightedLines = lines.map((line) =>
    highlightSyntax(line, language)
  );
  const highlightedHTML = highlightedLines.join("\n");

  return (
    <div className="border-t border-white/5 bg-bg-panel animate-slide-up">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-sm font-medium text-white">Corrected Code</span>
          <span className="text-xs text-text-muted font-mono capitalize">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Use in editor button */}
          <button
            onClick={() => onUseCode(fixedCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                       text-success border border-success/20 bg-success/10 hover:bg-success/20
                       transition-smooth"
            title="Replace editor code with fixed version"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
            </svg>
            <span className="hidden sm:inline">Use in Editor</span>
            <span className="sm:hidden">Use</span>
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                       transition-smooth ${
                         copied
                           ? "text-success border border-success/30 bg-success/10"
                           : "text-text-secondary border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
                       }`}
            title="Copy fixed code"
          >
            {copied ? (
              <>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded text-text-muted hover:text-white transition-smooth"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${isExpanded ? "" : "rotate-180"}`}
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Code display */}
      {isExpanded && (
        <div className="relative overflow-hidden">
          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-bg-panel to-transparent pointer-events-none z-10" />

          <div className="flex max-h-72 overflow-auto editor-scroll">
            {/* Line numbers */}
            <div
              className="flex-none w-12 md:w-14 bg-bg-editor border-r border-white/5 select-none py-4"
              style={{ overflowY: "hidden" }}
            >
              {lines.map((_, i) => (
                <div
                  key={i}
                  className="text-right pr-3 font-mono text-xs text-text-muted/30"
                  style={{ height: "22.4px", lineHeight: "22.4px" }}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Highlighted code */}
            <div
              className="flex-1 bg-bg-editor font-mono text-sm py-4 px-4 overflow-x-auto whitespace-pre"
              style={{ lineHeight: "22.4px" }}
              dangerouslySetInnerHTML={{ __html: highlightedHTML }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
