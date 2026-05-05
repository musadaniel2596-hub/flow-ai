import { callOpenRouter } from "./openrouter";

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

/**
 * Analyze code for errors using OpenRouter AI
 */
export async function analyzeCode(code: string): Promise<AnalysisResult> {
  const model = process.env.OPENROUTER_MODEL || "openrouter/auto";

  const systemPrompt = `You are an expert code debugger. Analyze the provided code and return ONLY a valid JSON object with no markdown, no backticks, no explanation outside the JSON.

The JSON must follow this exact structure:
{
  "language": "detected programming language name",
  "errors": [
    {
      "line": <line number as integer>,
      "message": "clear description of the error",
      "fix": "specific fix instruction",
      "severity": "error" | "warning" | "info"
    }
  ],
  "fixedCode": "the complete corrected code as a string",
  "summary": "brief one-sentence summary of all issues found"
}

Rules:
- If no errors found, return empty errors array and set fixedCode to the original code
- Always detect the programming language
- Line numbers must be accurate integers
- fixedCode must be the complete working code, not just the fixed parts
- Return ONLY the JSON object, nothing else`;

  const userMessage = `Analyze this code:\n\n${code}`;

  const rawResponse = await callOpenRouter(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    model
  );

  // Parse and validate the JSON response
  return parseAnalysisResponse(rawResponse);
}

/**
 * Safely parse the AI response into AnalysisResult
 */
function parseAnalysisResponse(raw: string): AnalysisResult {
  // Strip any accidental markdown fences
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  let parsed: AnalysisResult;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from response if there's surrounding text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("AI returned invalid JSON response");
    }
  }

  // Validate and normalize the structure
  return {
    language: parsed.language || "unknown",
    errors: Array.isArray(parsed.errors)
      ? parsed.errors.map((e) => ({
          line: typeof e.line === "number" ? e.line : parseInt(e.line) || 0,
          message: e.message || "Unknown error",
          fix: e.fix || "Review this line",
          severity: (["error", "warning", "info"].includes(e.severity)
            ? e.severity
            : "error") as "error" | "warning" | "info",
        }))
      : [],
    fixedCode: parsed.fixedCode || "",
    summary: parsed.summary || "Analysis complete",
  };
}
