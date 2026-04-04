#!/usr/bin/env npx tsx
/**
 * CryptoGotchi — Gemini AI Live Test
 *
 * Tests all 4 AI services + pet reaction with real Gemini 2.5 Flash.
 * Verifies system prompts are working correctly for each service type.
 *
 * Prerequisites:
 *   1. GEMINI_API_KEY set in .env.local (repo root)
 *
 * Usage (from apps/web directory):
 *   pnpm gemini:test
 *
 *   Or manually:
 *   GEMINI_API_KEY=... npx tsx scripts/test-gemini-live.ts
 */

import { callGemini, callGeminiWithCustomPrompt, getPetReactionPrompt } from "@cryptogotchi/ai-service";
import type { ServiceType } from "@cryptogotchi/shared";

const TEST_INPUTS: Record<ServiceType, string> = {
  summarize:
    "Bitcoin is a decentralized digital currency created in 2009 by Satoshi Nakamoto. It uses blockchain technology to enable peer-to-peer transactions without intermediaries. The network is secured through proof-of-work mining with a fixed supply of 21 million coins.",
  fortune: "Give me a crypto fortune prediction. My wallet address starts with 0xc6b7.",
  "code-review":
    'Please review the following code (Language: TypeScript):\n\n```\nfunction add(a: number, b: number): number {\n  return a + b;\n}\n\nconst result = add(1, "2" as any);\nconsole.log(result);\n```',
  crypto: "Crypto market question: What is the current sentiment on Ethereum Layer 2 solutions?",
};

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("ERROR: GEMINI_API_KEY environment variable is required.");
    console.error("");
    console.error("Usage:");
    console.error("  pnpm gemini:test              (reads from ../../.env.local)");
    console.error("  GEMINI_API_KEY=... npx tsx scripts/test-gemini-live.ts");
    process.exit(1);
  }

  console.log("=========================================");
  console.log("  CryptoGotchi Gemini AI Live Test");
  console.log("  " + new Date().toISOString());
  console.log("=========================================");
  console.log("");

  const config = { apiKey };
  const services: ServiceType[] = ["summarize", "fortune", "code-review", "crypto"];

  let passed = 0;
  let failed = 0;

  for (const service of services) {
    console.log(`--- ${service.toUpperCase()} ---`);
    const input = TEST_INPUTS[service];

    try {
      const start = Date.now();
      const result = await callGemini(config, service, input);
      const elapsed = Date.now() - start;

      if (result.error) {
        console.log(`[FAIL] ${service}: ${result.error}`);
        failed++;
      } else {
        const preview = result.text.slice(0, 200) + (result.text.length > 200 ? "..." : "");
        console.log(`[PASS] ${service} (${elapsed}ms)`);
        console.log(`  Response: ${preview}`);
        passed++;
      }
    } catch (err) {
      console.log(`[FAIL] ${service}: ${err instanceof Error ? err.message : err}`);
      failed++;
    }
    console.log("");
  }

  // Test pet reaction
  console.log("--- PET REACTION ---");
  try {
    const start = Date.now();
    const result = await callGeminiWithCustomPrompt(
      config,
      null,
      "Generate a short pet reaction to completing a summarize task",
      getPetReactionPrompt(),
    );
    const elapsed = Date.now() - start;

    if (result.error) {
      console.log(`[FAIL] pet-reaction: ${result.error}`);
      failed++;
    } else {
      console.log(`[PASS] pet-reaction (${elapsed}ms)`);
      console.log(`  Response: ${result.text}`);
      passed++;
    }
  } catch (err) {
    console.log(`[FAIL] pet-reaction: ${err instanceof Error ? err.message : err}`);
    failed++;
  }
  console.log("");

  // Summary
  const total = passed + failed;
  console.log("=========================================");
  console.log(`  Results: ${passed}/${total} passed`);
  console.log(`  Model: gemini-2.5-flash`);
  console.log("=========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

void main();
