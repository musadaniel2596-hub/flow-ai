"use client";

import { useState, useCallback, useEffect } from "react";
import { AnalysisResult, AnalysisState } from "@/types";
import { analyzeCode, analyzeImage } from "@/lib/api";
import { detectLanguage } from "@/lib/detectLanguage";
import Header from "@/components/Layout/Header";
import EditorToolbar from "@/components/Editor/EditorToolbar";
import Editor from "@/components/Editor/Editor";
import ErrorPanel from "@/components/AI/ErrorPanel";
import FixPanel from "@/components/AI/FixPanel";
import CameraUpload from "@/components/Scanner/CameraUpload";

// Sample code shown on first load
const SAMPLE_CODE = `function calculateTotal(items) {
  let total = 0
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price
  }
  return totla
}

const cart = [
  { name: 'Apple', price: 1.5 }
  { name: 'Bread', price: 2.99 },
]

console.log('Total: $' + calculateTotal(cart))
`;

export default function HomePage() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);
  const [imageLoading, setImageLoading] = useState(false);

  // Detect language from code (client-side heuristic)
  const detectedLanguage = detectLanguage(code);
  const displayLanguage = result?.language || detectedLanguage;

  const totalLines = code.split("\n").length;

  // ─── Analyze Code ───────────────────────────────────────────────────────────

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) return;

    setAnalysisState("loading");
    setError(null);
    setResult(null);

    try {
      const data = await analyzeCode(code);
      setResult(data);
      setAnalysisState("success");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to analyze code";
      setError(msg);
      setAnalysisState("error");
    }
  }, [code]);

  // ─── Image Upload ───────────────────────────────────────────────────────────

  const handleImageSelected = useCallback(async (file: File) => {
    setImageLoading(true);
    setError(null);

    try {
      const data = await analyzeImage(file);
      // If vision extracted code, put it in editor
      if (data.fixedCode || data.errors.length > 0) {
        // Use fixedCode as the "extracted" code if no original errors
        // or set editor to extracted version
      }
      setResult(data);
      setAnalysisState("success");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to analyze image";
      setError(msg);
      setAnalysisState("error");
    } finally {
      setImageLoading(false);
    }
  }, []);

  // ─── Editor Actions ─────────────────────────────────────────────────────────

  const handleClear = useCallback(() => {
    setCode("");
    setResult(null);
    setError(null);
    setAnalysisState("idle");
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // fallback
    }
  }, [code]);

  const handleUseFixedCode = useCallback((fixedCode: string) => {
    setCode(fixedCode);
    setResult(null);
    setAnalysisState("idle");
  }, []);

  // Keyboard shortcut: Ctrl/Cmd+Enter to analyze
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleAnalyze();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleAnalyze]);

  const isLoading = analysisState === "loading" || imageLoading;
  const hasResult = analysisState === "success" && result !== null;

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Hero radial gradient */}
      <div
        className="fixed top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "50vh",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)",
        }}
      />

      {/* ── Header ── */}
      <Header language={displayLanguage !== "unknown" ? displayLanguage : undefined} />

      {/* ── Toolbar ── */}
      <EditorToolbar
        onAnalyze={handleAnalyze}
        onClear={handleClear}
        onCopy={handleCopy}
        isLoading={isLoading}
        hasCode={code.trim().length > 0}
        cursorInfo={{ line: cursorLine, col: cursorCol, total: totalLines }}
      />

      {/* ── Main content: scrollable area ── */}
      <div className="flex-1 overflow-y-auto min-h-0 relative">
        {/* Loading overlay */}
        {analysisState === "loading" && (
          <div className="absolute top-0 left-0 right-0 z-20 h-0.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-blue"
              style={{
                animation: "scan-line 1.5s ease-in-out infinite",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        )}

        {/* ── Editor ── */}
        <div
          style={{ minHeight: "320px", height: "clamp(320px, 50vh, 600px)" }}
          className="flex flex-col border-b border-white/5"
        >
          <Editor
            code={code}
            language={displayLanguage}
            errors={result?.errors || []}
            onChange={setCode}
            onCursorChange={(line, col) => {
              setCursorLine(line);
              setCursorCol(col);
            }}
          />
        </div>

        {/* ── Camera upload ── */}
        <CameraUpload
          onImageSelected={handleImageSelected}
          isLoading={imageLoading}
        />

        {/* ── Keyboard shortcut hint ── */}
        {analysisState === "idle" && code.trim() && (
          <div className="px-4 md:px-6 py-2 text-center">
            <p className="text-xs text-text-muted/50">
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-xs text-text-muted">
                ⌘ Enter
              </kbd>{" "}
              or click{" "}
              <span className="text-accent-blue">Analyze Code</span> to debug
            </p>
          </div>
        )}

        {/* ── Error state ── */}
        {analysisState === "error" && error && (
          <div className="mx-4 md:mx-6 my-3 flex items-start gap-3 p-4 rounded-xl bg-error-red/10 border border-error-red/20 animate-slide-up">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              className="flex-none mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="text-sm font-medium text-error-red">
                Analysis Failed
              </p>
              <p className="text-xs text-text-secondary mt-0.5">{error}</p>
              <p className="text-xs text-text-muted mt-1">
                Check that your API key is set and you have internet access.
              </p>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        <ErrorPanel
          errors={result?.errors || []}
          summary={result?.summary || ""}
          language={result?.language || ""}
          isVisible={hasResult}
        />

        <FixPanel
          fixedCode={result?.fixedCode || ""}
          language={result?.language || displayLanguage}
          isVisible={hasResult && !!result?.fixedCode}
          onUseCode={handleUseFixedCode}
        />

        {/* ── Bottom padding ── */}
        <div className="h-8" />
      </div>

      {/* ── Status bar ── */}
      <div className="flex-none flex items-center justify-between px-4 md:px-6 py-1.5 border-t border-white/5 bg-bg-secondary/80 text-xs text-text-muted font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLoading
                  ? "bg-warning animate-pulse"
                  : hasResult
                  ? result && result.errors.length > 0
                    ? "bg-error-red"
                    : "bg-success"
                  : "bg-text-muted/30"
              }`}
            />
            {isLoading
              ? "Analyzing..."
              : hasResult
              ? result && result.errors.length > 0
                ? `${result.errors.length} issue${result.errors.length !== 1 ? "s" : ""}`
                : "Clean"
              : "Ready"}
          </span>
        </div>

        <div className="flex items-center gap-3 opacity-60">
          <span>Flow AI v1.0</span>
          <span>·</span>
          <span>OpenRouter</span>
        </div>
      </div>
    </div>
  );
}
