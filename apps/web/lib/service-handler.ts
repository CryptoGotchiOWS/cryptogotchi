/**
 * Service Handler Factory
 *
 * Creates Next.js route handlers with:
 * - Mock/live AI toggle (Gemini vs mock responses)
 * - Mock/live payment toggle (x402 vs passthrough)
 * - Pet reaction generation (dedicated prompt)
 * - Malformed JSON → 400, AI errors → graceful fallback
 */

import { NextRequest, NextResponse } from "next/server";
import type { ServiceType } from "@cryptogotchi/shared";
import { SERVICE_PRICES } from "@cryptogotchi/shared";
import {
  callGemini,
  callGeminiWithCustomPrompt,
  getMockResponse,
  getMockPetReaction,
  getPetReactionPrompt,
} from "@cryptogotchi/ai-service";
import { withMockPayment } from "./x402-mock";
import { withX402Live, createRouteConfig, declareDiscovery } from "./x402-server";

interface DiscoveryMetadata {
  inputExample?: Record<string, unknown>;
  inputSchema?: Record<string, unknown>;
  outputExample?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

interface ServiceHandlerOptions {
  buildUserPrompt: (body: Record<string, unknown>) => string;
  formatResponse: (aiText: string, petReaction: string) => Record<string, unknown>;
  validateBody?: (body: Record<string, unknown>) => string | null;
  discovery?: DiscoveryMetadata;
}

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

function isMockMode(): boolean {
  return process.env.X402_MOCK !== "false";
}

function hasGeminiKey(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

async function getAIResponse(
  serviceType: ServiceType,
  userInput: string,
): Promise<string> {
  if (!hasGeminiKey()) {
    return getMockResponse(serviceType);
  }

  const result = await callGemini(
    { apiKey: process.env.GEMINI_API_KEY! },
    serviceType,
    userInput,
  );

  if (result.error || !result.text) {
    console.warn(`[AI] Gemini error for ${serviceType}: ${result.error}, using mock`);
    return getMockResponse(serviceType);
  }

  return result.text;
}

async function getPetReaction(): Promise<string> {
  if (!hasGeminiKey()) {
    return getMockPetReaction();
  }

  try {
    const result = await callGeminiWithCustomPrompt(
      { apiKey: process.env.GEMINI_API_KEY! },
      null, // no service-specific prompt
      "Generate a short pet reaction to completing a task",
      getPetReactionPrompt(),
    );

    if (result.error || !result.text) {
      return getMockPetReaction();
    }
    return result.text;
  } catch {
    return getMockPetReaction();
  }
}

export function createServiceHandler(
  serviceType: ServiceType,
  options: ServiceHandlerOptions,
): RouteHandler {
  const price = SERVICE_PRICES[serviceType];
  const description = `CryptoGotchi ${serviceType} service`;

  const handler: RouteHandler = async (req: NextRequest) => {
    // Parse JSON separately — malformed JSON is a 400, not a fallback
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    try {
      // Validate request body
      if (options.validateBody) {
        const error = options.validateBody(body);
        if (error) {
          return NextResponse.json({ error }, { status: 400 });
        }
      }

      // Generate AI response + pet reaction in parallel
      const userPrompt = options.buildUserPrompt(body);
      const [aiText, petReaction] = await Promise.all([
        getAIResponse(serviceType, userPrompt),
        getPetReaction(),
      ]);

      const responseData = options.formatResponse(aiText, petReaction);
      return NextResponse.json(responseData);
    } catch (error) {
      console.error(`[Service:${serviceType}] Error:`, error);

      // Emergency fallback for AI/processing errors only (not parse errors)
      const fallbackText = getMockResponse(serviceType);
      const fallbackReaction = getMockPetReaction();
      const responseData = options.formatResponse(fallbackText, fallbackReaction);
      return NextResponse.json(responseData);
    }
  };

  // Wrap with payment layer
  if (isMockMode()) {
    return withMockPayment(handler, { price, description });
  }

  // Live mode: wrap with real x402 payment verification
  const extensions = options.discovery
    ? declareDiscovery({
        input: options.discovery.inputExample,
        inputSchema: options.discovery.inputSchema,
        outputExample: options.discovery.outputExample,
        outputSchema: options.discovery.outputSchema,
      })
    : null;
  const routeConfig = createRouteConfig(
    price,
    description,
    extensions ?? undefined,
  );
  return createLiveHandler(handler, routeConfig);
}

function createLiveHandler(
  handler: RouteHandler,
  routeConfig: ReturnType<typeof createRouteConfig>,
): RouteHandler {
  let wrappedHandler: RouteHandler | null = null;

  return async (req: NextRequest) => {
    try {
      if (!wrappedHandler) {
        wrappedHandler = await withX402Live(handler, routeConfig);
      }
      return wrappedHandler(req);
    } catch (err) {
      console.error("[x402] Payment gate initialization failed:", err);
      return NextResponse.json(
        { error: "Payment service unavailable" },
        { status: 503 },
      );
    }
  };
}
