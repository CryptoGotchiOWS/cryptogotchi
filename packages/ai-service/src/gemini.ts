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
  const systemPrompt = getSystemPrompt(serviceType);
  return callGeminiWithCustomPrompt(config, serviceType, userInput, systemPrompt);
}

export async function callGeminiWithCustomPrompt(
  config: GeminiConfig,
  _serviceType: ServiceType | null,
  userInput: string,
  systemPrompt?: string,
): Promise<GeminiResponse> {
  const { apiKey, model = "gemini-2.5-flash" } = config;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: userInput,
      config: {
        ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
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
