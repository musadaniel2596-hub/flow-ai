"use client";

import { CodeError } from "@/types";

interface ErrorPanelProps {
  errors: CodeError[];
  summary: string;
  language: string;
  isVisible: boolean;
  onSelectError?: (line: number) => void;
}

const SEVERITY_CONFIG = {
  error: {
    color: "text-error-red",
    bg: "bg-error-red/10",
    border: "border-error-red/20",
    dot: "bg-error-red",
    label: "Error",
  },
  warning: {
    color: "text-warning-orange",
    bg: "bg-warning-orange/10",
    border: "border-warning-orange/20",
    dot: "bg-warning-orange",
    label: "Warning",
  },
  info: {
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
    border: "border-accent-cyan/20",
    dot: "bg-accent-cyan",
    label: "Info",
  },
};

export default function ErrorPanel({
  errors,
  summary,
  language,
  isVisible,
  onSelectError,
}: ErrorPanelProps) {
  if (!isVisible) return null;

  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;

  return (
    <div className="border-t border-white/5 bg-bg-panel animate-fade-in">
      {/* Panel header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-6 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                errorCount > 0 ? "bg-error-red animate-pulse" : "bg-emerald-500"
              }`}
            />
            <span className="text-sm font-medium text-white">
              {errorCount === 0 && warningCount === 0 ? "No Issues Found" : "Analysis Results"}
            </span>
          </div>

          {/* Counts */}
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-red/15 text-error-red text-[10px] font-bold uppercase tracking-wider">
                {errorCount} {errorCount === 1 ? "error" : "errors"}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-orange/15 text-warning-orange text-[10px] font-bold uppercase tracking-wider">
                {warningCount} {warningCount === 1 ? "warning" : "warnings"}
              </span>
            )}
          </div>
        </div>

        {/* Language badge */}
        {language && language !== "unknown" && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted px-2 py-1 rounded bg-white/5 border border-white/5">
            {language}
          </span>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="px-4 md:px-6 py-3 border-b border-white/5 bg-white/[0.01] italic">
          <p className="text-xs text-text-secondary leading-relaxed">"{summary}"</p>
        </div>
      )}

      {/* Error list */}
      {errors.length > 0 ? (
        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto editor-scroll">
          {errors.map((error, index) => {
            const cfg = SEVERITY_CONFIG[error.severity] || SEVERITY_CONFIG.error;
            return (
              <button
                key={index}
                onClick={() => onSelectError?.(error.line)}
                className={`w-full flex items-start gap-4 px-4 md:px-6 py-4 hover:bg-white/[0.03] transition-all text-left group border-l-2 border-transparent hover:border-current ${cfg.color}`}
              >
                {/* Severity indicator */}
                <div className="flex-none pt-1">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase">
                      Line {error.line}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-tighter opacity-70`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary font-medium leading-snug group-hover:text-white transition-colors">
                    {error.message}
                  </p>

                  <div className="mt-3 flex flex-col gap-2 p-3 rounded-lg bg-black/20 border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent-cyan">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider">Suggested Fix</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed pl-6 italic">
                      {error.fix}
                    </p>
                  </div>
                </div>

                <div className="flex-none self-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                     <path d="m9 18 6-6-6-6" />
                   </svg>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-white">Your code is crystal clear</h3>
          <p className="text-sm text-text-muted mt-1">We couldn't find any issues to report. Great job!</p>
        </div>
      )}
    </div>
  );
}
