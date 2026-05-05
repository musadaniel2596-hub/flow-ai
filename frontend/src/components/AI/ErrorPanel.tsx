"use client";

import { CodeError } from "@/types";

interface ErrorPanelProps {
  errors: CodeError[];
  summary: string;
  language: string;
  isVisible: boolean;
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
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    dot: "bg-warning",
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
}: ErrorPanelProps) {
  if (!isVisible) return null;

  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;

  return (
    <div className="border-t border-white/5 bg-bg-panel animate-slide-up">
      {/* Panel header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-6 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                errorCount > 0 ? "bg-error-red animate-pulse" : "bg-success"
              }`}
            />
            <span className="text-sm font-medium text-white">
              {errorCount === 0 ? "No Errors Found" : "Issues Detected"}
            </span>
          </div>

          {/* Counts */}
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-red/15 text-error-red text-xs font-medium">
                <span>{errorCount}</span>
                <span>{errorCount === 1 ? "error" : "errors"}</span>
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 text-warning text-xs font-medium">
                <span>{warningCount}</span>
                <span>{warningCount === 1 ? "warning" : "warnings"}</span>
              </span>
            )}
          </div>
        </div>

        {/* Language badge */}
        {language && language !== "unknown" && (
          <span className="text-xs text-text-muted font-mono capitalize">
            {language}
          </span>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="px-4 md:px-6 py-2 border-b border-white/5 bg-white/[0.015]">
          <p className="text-xs text-text-secondary">{summary}</p>
        </div>
      )}

      {/* Error list */}
      {errors.length > 0 ? (
        <div className="divide-y divide-white/5 max-h-64 overflow-y-auto editor-scroll">
          {errors.map((error, index) => {
            const cfg = SEVERITY_CONFIG[error.severity] || SEVERITY_CONFIG.error;
            return (
              <div
                key={index}
                className={`flex items-start gap-3 px-4 md:px-6 py-3 hover:bg-white/[0.02] transition-smooth ${cfg.bg} border-l-2 ${cfg.border}`}
              >
                {/* Severity dot */}
                <div className="flex-none mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mt-1`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold font-mono ${cfg.color}`}
                    >
                      Line {error.line}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary leading-snug">
                    {error.message}
                  </p>
                  <div className="flex items-start gap-1 mt-1.5">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                      className="flex-none mt-0.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <p className="text-xs text-accent-cyan">{error.fix}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 md:px-6 py-4">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-success">
              Your code looks clean!
            </p>
            <p className="text-xs text-text-muted">
              No errors or warnings were detected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
