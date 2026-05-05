import { CodeError } from "@/types";

/**
 * Given highlighted HTML lines and errors, wrap error lines with highlight spans
 */
export function applyErrorHighlights(
  lines: string[],
  errors: CodeError[]
): string[] {
  // Build a map of line number → severity
  const errorMap = new Map<number, "error" | "warning" | "info">();

  for (const err of errors) {
    const existing = errorMap.get(err.line);
    // Error severity takes precedence
    if (!existing || existing !== "error") {
      errorMap.set(err.line, err.severity);
    }
  }

  return lines.map((line, index) => {
    const lineNum = index + 1;
    const severity = errorMap.get(lineNum);

    if (!severity) return line;

    const className =
      severity === "error"
        ? "error-line"
        : severity === "warning"
        ? "warning-line"
        : "";

    return className ? `<span class="${className}">${line}</span>` : line;
  });
}

/**
 * Check if a specific line number has an error
 */
export function getLineError(
  lineNum: number,
  errors: CodeError[]
): CodeError | undefined {
  return errors.find((e) => e.line === lineNum);
}
