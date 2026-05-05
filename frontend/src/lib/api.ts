import { AnalysisResult } from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Analyze code via the backend API
 */
export async function analyzeCode(code: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Analyze an image (screenshot of code) via the backend vision API
 */
export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/vision`, {
    method: "POST",
    body: formData,
    // Don't set Content-Type — browser sets it with boundary for multipart
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Vision API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
