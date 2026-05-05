import { callOpenRouter } from "./openrouter";
import { analyzeCode, AnalysisResult } from "./analyzeCode";

/**
 * Extract code from an image and analyze it for errors
 */
export async function analyzeImage(
  base64Image: string,
  mimeType: string
): Promise<AnalysisResult> {
  const visionModel =
    process.env.OPENROUTER_VISION_MODEL ||
    "meta-llama/llama-3.2-90b-vision-instruct";

  // Step 1: Extract code from the image using the vision model
  const extractionResponse = await callOpenRouter(
    [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
          {
            type: "text",
            text: 'Extract all code visible in this image. Return ONLY the raw code, preserving indentation and formatting. Do not add any explanation, comments, or markdown fences. If no code is visible, return the text "NO_CODE_FOUND".',
          },
        ],
      },
    ],
    visionModel
  );

  const extractedCode = extractionResponse.trim();

  if (
    extractedCode === "NO_CODE_FOUND" ||
    extractedCode.toLowerCase().includes("no code")
  ) {
    return {
      language: "unknown",
      errors: [],
      fixedCode: "",
      summary: "No code was detected in the uploaded image.",
    };
  }

  // Step 2: Analyze the extracted code using the standard code analyzer
  return analyzeCode(extractedCode);
}
