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
  if (_initFailed) throw new Error("[x402] Live mode init previously failed — refusing to serve without payment gate");

  try {
    // Use Function constructor to hide dynamic require from Turbopack static analysis
    const load = new Function("mod", "return require(mod)");
    const x402Core = load("@x402/core/server");
    const x402EvmExact = load("@x402/evm/exact/server");

    const facilitatorUrl =
      process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";

    const facilitator = new x402Core.HTTPFacilitatorClient(facilitatorUrl);
    const server = new x402Core.x402ResourceServer(facilitator);
    server.register("eip155:84532", new x402EvmExact.ExactEvmScheme());

    _serverInstance = server;
    return server;
  } catch (err) {
    _initFailed = true;
    throw new Error(`[x402] Live mode packages not available: ${(err as Error).message}`);
  }
}

export async function withX402Live(
  handler: RouteHandler,
  routeConfig: RouteConfig,
): Promise<RouteHandler> {
  // Fail-closed: if server init or withX402 load fails, throw — never serve without payment gate
  const server = await getOrCreateServer();

  const load = new Function("mod", "return require(mod)");
  const { withX402 } = load("@x402/next");
  return withX402(handler, routeConfig, server);
}

export function createRouteConfig(price: string, description: string): RouteConfig {
  const payTo = process.env.PAY_TO_ADDRESS;
  if (!payTo) {
    throw new Error("[x402] PAY_TO_ADDRESS env var is required in live mode");
  }

  return {
    accepts: [
      {
        scheme: "exact",
        price,
        network: "eip155:84532",
        payTo,
      },
    ],
    description,
    mimeType: "application/json",
  };
}
