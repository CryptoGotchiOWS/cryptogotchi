import { GoogleGenAI } from "@google/genai";
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
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: userInput,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const text = response.text ?? "No response generated";
    return { text };
  } catch (error) {
    return {
      text: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
