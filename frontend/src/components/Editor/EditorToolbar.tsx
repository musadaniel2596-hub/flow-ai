"use client";

interface EditorToolbarProps {
  onAnalyze: () => void;
  onClear: () => void;
  onCopy: () => void;
  isLoading: boolean;
  hasCode: boolean;
  cursorInfo: { line: number; col: number; total: number };
}

export default function EditorToolbar({
  onAnalyze,
  onClear,
  onCopy,
  isLoading,
  hasCode,
  cursorInfo,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-6 py-2.5 border-b border-white/5 bg-bg-panel/50">
      {/* Left: editor info */}
      <div className="flex items-center gap-4 text-xs text-text-muted font-mono">
        <span className="hidden sm:block">
          Ln {cursorInfo.line}, Col {cursorInfo.col}
        </span>
        <span className="text-text-muted/60">|</span>
        <span>{cursorInfo.total} lines</span>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2">
        {/* Copy button */}
        <button
          onClick={onCopy}
          disabled={!hasCode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                     text-text-secondary hover:text-white border border-white/10
                     hover:border-white/20 bg-white/5 hover:bg-white/10
                     transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
          title="Copy code"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span className="hidden sm:inline">Copy</span>
        </button>

        {/* Clear button */}
        <button
          onClick={onClear}
          disabled={!hasCode || isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                     text-text-secondary hover:text-white border border-white/10
                     hover:border-white/20 bg-white/5 hover:bg-white/10
                     transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
          title="Clear editor"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
          <span className="hidden sm:inline">Clear</span>
        </button>

        {/* Analyze button — the main CTA */}
        <button
          onClick={onAnalyze}
          disabled={!hasCode || isLoading}
          className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold
                     bg-accent-blue hover:bg-blue-500 text-white
                     transition-smooth disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-accent-blue/20 hover:shadow-accent-blue/30
                     glow-blue"
          title="Analyze code with AI"
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
              Analyzing...
            </>
          ) : (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Analyze Code
            </>
          )}
        </button>
      </div>
    </div>
  );
}
