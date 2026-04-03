/**
 * x402 Live Mode Server Setup
 *
 * Uses @x402/next + @x402/evm for real payment verification.
 * Only loaded when X402_MOCK=false and x402 packages are installed.
 *
 * Verified API (April 2026):
 *   new x402ResourceServer(facilitator).register("eip155:84532", new ExactEvmScheme())
 *   withX402(handler, routeConfig, server) from @x402/next
 *
 * NOTE: This file uses `require()` behind a try/catch so Turbopack does not
 * attempt to statically resolve the optional x402 packages at build time.
 * The `as string` dynamic-import trick no longer works with Turbopack in
 * Next.js 16. Instead we keep this module free of any x402 import
 * statements and load them at runtime via a helper.
 */

import type { NextRequest, NextResponse } from "next/server";

export interface RouteConfig {
  accepts: Array<{
    scheme: string;
    price: string;
    network: string;
    payTo: string;
  }>;
  description: string;
  mimeType: string;
}

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _serverInstance: any = null;
let _initFailed = false;

async function getOrCreateServer() {
  if (_serverInstance) return _serverInstance;
  if (_initFailed) return null;

  try {
    // Use Function constructor to hide dynamic require from Turbopack static analysis
    const load = new Function("mod", "return require(mod)");
    const x402Next = load("@x402/next");
    const x402Evm = load("@x402/evm");

    const facilitatorUrl =
      process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";

    const facilitator = new x402Next.HTTPFacilitatorClient(facilitatorUrl);
    const server = new x402Next.x402ResourceServer(facilitator);
    server.register("eip155:84532", new x402Evm.ExactEvmScheme());

    _serverInstance = server;
    return server;
  } catch (err) {
    _initFailed = true;
    console.warn("[x402] Live mode packages not available:", (err as Error).message);
    return null;
  }
}

export async function withX402Live(
  handler: RouteHandler,
  routeConfig: RouteConfig,
): Promise<RouteHandler> {
  const server = await getOrCreateServer();

  if (!server) {
    console.warn("[x402] Live mode unavailable, handler will run without payment gate");
    return handler;
  }

  try {
    const load = new Function("mod", "return require(mod)");
    const { withX402 } = load("@x402/next");
    return withX402(handler, routeConfig, server);
  } catch {
    return handler;
  }
}

export function createRouteConfig(price: string, description: string): RouteConfig {
  return {
    accepts: [
      {
        scheme: "exact",
        price,
        network: "eip155:84532",
        payTo: process.env.PAY_TO_ADDRESS || "0x0000000000000000000000000000000000000000",
      },
    ],
    description,
    mimeType: "application/json",
  };
}
