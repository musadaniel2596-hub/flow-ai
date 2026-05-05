// Core analysis types shared across the app

export interface CodeError {
  line: number;
  message: string;
  fix: string;
  severity: "error" | "warning" | "info";
}

export interface AnalysisResult {
  language: string;
  errors: CodeError[];
  fixedCode: string;
  summary: string;
}

export type AnalysisState = "idle" | "loading" | "success" | "error";

export interface EditorState {
  code: string;
  cursorLine: number;
  cursorCol: number;
  totalLines: number;
}
