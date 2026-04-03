import type { ServiceType } from "@cryptogotchi/shared";
import { getSystemPrompt } from "./prompts";

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

export async function callGemini(
  config: GeminiConfig,
  serviceType: ServiceType,
  userInput: string,
): Promise<GeminiResponse> {
  const { apiKey, model = "gemini-2.5-flash" } = config;
  const systemPrompt = getSystemPrompt(serviceType);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userInput }] }],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response generated";
    return { text };
  } catch (error) {
    return {
      text: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
