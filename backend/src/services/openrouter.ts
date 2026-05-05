import fetch from "node-fetch";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content:
    | string
    | Array<{
        type: "text" | "image_url";
        text?: string;
        image_url?: { url: string };
      }>;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Call OpenRouter API with given messages and model
 */
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  model: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
      "X-Title": "Flow AI",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.1, // Low temperature for deterministic code analysis
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = (await response.json()) as OpenRouterResponse;

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from OpenRouter API");
  }

  return data.choices[0].message.content;
}
