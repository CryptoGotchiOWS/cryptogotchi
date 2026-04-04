#!/usr/bin/env npx tsx
/**
 * CryptoGotchi x402 Live Payment Demo
 *
 * Buyer-side script that makes a REAL x402 payment to the CryptoGotchi
 * summarize endpoint on Base Sepolia testnet.
 *
 * This script runs OUTSIDE the browser. Private key is NEVER exposed to
 * client-side code.
 *
 * Prerequisites:
 *   1. Server running with X402_MOCK=false: pnpm dev (in apps/web)
 *   2. PAY_TO_ADDRESS set in server .env.local (repo root)
 *   3. BUYER_PRIVATE_KEY set in .env.local (repo root)
 *   4. Testnet USDC from faucet.circle.com
 *
 * Usage (from apps/web directory):
 *   pnpm x402:demo
 *
 *   Or manually:
 *   BUYER_PRIVATE_KEY=0x... npx tsx scripts/live-x402-demo.ts
 */

import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

async function main() {
  // --- Configuration ---
  const BUYER_KEY = process.env.BUYER_PRIVATE_KEY;
  const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

  // --- Validation ---
  if (!BUYER_KEY) {
    console.error("ERROR: BUYER_PRIVATE_KEY environment variable is required.");
    console.error("");
    console.error("Usage:");
    console.error("  pnpm x402:demo                (reads from ../../.env.local)");
    console.error("  BUYER_PRIVATE_KEY=0x... npx tsx scripts/live-x402-demo.ts");
    process.exit(1);
  }

  if (!BUYER_KEY.startsWith("0x") || BUYER_KEY.length !== 66) {
    console.error("ERROR: BUYER_PRIVATE_KEY must be a 0x-prefixed 64-char hex string.");
    process.exit(1);
  }

  // --- Setup ---
  console.log("=========================================");
  console.log("  CryptoGotchi x402 Live Payment Demo");
  console.log("  " + new Date().toISOString());
  console.log("=========================================");
  console.log("");

  // Step 1: Create signer from private key
  const signer = privateKeyToAccount(BUYER_KEY as `0x${string}`);
  console.log("[1/5] Buyer wallet:", signer.address);

  // Step 2: Create x402 client
  const client = new x402Client();
  console.log("[2/5] x402 client created");

  // Step 3: Register EVM scheme (handles all eip155:* networks)
  registerExactEvmScheme(client, { signer });
  console.log("[3/5] EVM scheme registered (Base Sepolia)");

  // Step 4: Wrap fetch with x402 payment handling
  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  console.log("[4/5] Fetch wrapped with x402 payment handler");
  console.log("");

  // Step 5: Make the paid request
  const endpoint = `${SERVER_URL}/api/services/summarize`;
  console.log(`[5/5] Sending paid request to: ${endpoint}`);
  console.log("---");

  try {
    const startTime = Date.now();

    const response = await fetchWithPayment(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Bitcoin is a decentralized digital currency created in 2009 by the pseudonymous Satoshi Nakamoto. It uses blockchain technology to enable peer-to-peer transactions without intermediaries like banks. The network is secured through proof-of-work mining, where computers compete to solve cryptographic puzzles. Bitcoin has a fixed supply of 21 million coins, making it deflationary by design.",
      }),
    });

    const elapsed = Date.now() - startTime;

    console.log("");
    console.log("--- RESPONSE ---");
    console.log("HTTP Status:", response.status);
    console.log("Time:", `${elapsed}ms`);

    // Extract payment info from all response headers
    const paymentResponse = response.headers.get("payment-response");
    const paymentStatus = response.headers.get("x-payment-status");

    if (paymentResponse) {
      console.log("");
      console.log("--- PAYMENT PROOF ---");
      console.log("Payment-Response:", paymentResponse);

      // Parse receipt — try base64 JSON, plain JSON, then key=value fallback
      let txHash: string | null = null;

      // Attempt 1: base64-encoded JSON (actual x402 facilitator format)
      try {
        const decoded = Buffer.from(paymentResponse, "base64").toString("utf-8");
        const parsed = JSON.parse(decoded);
        txHash = parsed.transaction || parsed.txHash || parsed.id || null;
        if (parsed.payer) console.log("Payer:", parsed.payer);
        if (parsed.network) console.log("Network:", parsed.network);
      } catch {
        // Not base64 JSON
      }

      // Attempt 2: plain JSON
      if (!txHash) {
        try {
          const parsed = JSON.parse(paymentResponse);
          txHash = parsed.transaction || parsed.txHash || parsed.id || null;
        } catch {
          // Not plain JSON
        }
      }

      // Attempt 3: key=value format
      if (!txHash) {
        const txMatch = paymentResponse.match(/(?:transaction|id|txHash)=([0-9a-fA-Fx]+)/i);
        if (txMatch) txHash = txMatch[1];
      }

      if (txHash) {
        console.log("TX Hash:", txHash);
        console.log("Basescan:", `https://sepolia.basescan.org/tx/${txHash}`);
      }
    } else if (paymentStatus) {
      console.log("");
      console.log("--- PAYMENT STATUS ---");
      console.log("X-Payment-Status:", paymentStatus);
      console.log("(This is mock mode — server returned mock payment headers)");
    } else {
      console.log("");
      console.log("--- NO PAYMENT HEADERS ---");
      console.log("Server may not have x402 enabled or returned no payment info.");
      // Log all headers for debugging
      console.log("All response headers:");
      response.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
    }

    // Print response body
    if (response.ok) {
      const result = await response.json();
      console.log("");
      console.log("--- SERVICE RESULT ---");
      console.log(JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.log("");
      console.log("--- ERROR ---");
      console.log("Status:", response.status);
      console.log("Body:", errorText);

      if (response.status === 402) {
        console.log("");
        console.log("Payment Required — server is in live x402 mode");
        console.log("but the payment was not accepted. Check:");
        console.log("  - Buyer wallet has testnet USDC (faucet.circle.com)");
        console.log("  - Buyer wallet has Base Sepolia ETH for gas");
        console.log("  - USDC contract: 0x036CbD53842c5426634e7929541eC2318f3dCF7e");
      } else if (response.status === 503) {
        console.log("");
        console.log("Service Unavailable — x402 server init failed. Check:");
        console.log("  - @x402/core, @x402/evm, @x402/next are installed");
        console.log("  - PAY_TO_ADDRESS is set in .env.local");
      }
    }
  } catch (error) {
    console.error("");
    console.error("--- REQUEST FAILED ---");
    console.error("Error:", error instanceof Error ? error.message : error);

    if (String(error).includes("ECONNREFUSED")) {
      console.error("");
      console.error("Server is not running. Start it with:");
      console.error("  cd apps/web && X402_MOCK=false pnpm dev");
    }
  }

  console.log("");
  console.log("=========================================");
  console.log("  Demo Complete");
  console.log("=========================================");
}

void main();
