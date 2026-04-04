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
 * NOTE: Turbopack in Next.js 16 runs API routes in ESM mode where global
 * `require` is not defined. We use `createRequire` from `node:module` to
 * create a CJS-compatible require function at runtime. This avoids both
 * Turbopack's static import analysis AND the "require is not defined" error.
 */

import type { NextRequest, NextResponse } from "next/server";
import { createRequire } from "node:module";

export interface RouteConfig {
  accepts: Array<{
    scheme: string;
    price: string;
    network: string;
    payTo: string;
  }>;
  description: string;
  mimeType: string;
  extensions?: Record<string, unknown>;
}

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

// createRequire needs a URL/path base — use process.cwd() as stable fallback
const dynamicRequire = createRequire(
  typeof import.meta?.url === "string"
    ? import.meta.url
    : process.cwd() + "/package.json",
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _serverInstance: any = null;
let _initFailed = false;

async function getOrCreateServer() {
  if (_serverInstance) return _serverInstance;
  if (_initFailed)
    throw new Error(
      "[x402] Live mode init previously failed — refusing to serve without payment gate",
    );

  try {
    const x402Core = dynamicRequire("@x402/core/server");
    const x402EvmExact = dynamicRequire("@x402/evm/exact/server");

    const facilitatorUrl =
      process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";

    const facilitator = new x402Core.HTTPFacilitatorClient(facilitatorUrl);
    const server = new x402Core.x402ResourceServer(facilitator);
    server.register("eip155:84532", new x402EvmExact.ExactEvmScheme());

    // Register Bazaar discovery extension (optional — graceful skip if not available)
    try {
      const x402Bazaar = dynamicRequire("@x402/extensions/bazaar");
      server.registerExtension(x402Bazaar.bazaarResourceServerExtension);
      console.log("[x402] Bazaar discovery extension registered");
    } catch {
      console.warn("[x402] Bazaar extension not available, skipping discovery");
    }

    _serverInstance = server;
    return server;
  } catch (err) {
    _initFailed = true;
    throw new Error(
      `[x402] Live mode packages not available: ${(err as Error).message}`,
    );
  }
}

export async function withX402Live(
  handler: RouteHandler,
  routeConfig: RouteConfig,
): Promise<RouteHandler> {
  // Fail-closed: if server init or withX402 load fails, throw — never serve without payment gate
  const server = await getOrCreateServer();

  const { withX402 } = dynamicRequire("@x402/next");
  return withX402(handler, routeConfig, server);
}

export function createRouteConfig(
  price: string,
  description: string,
  extensions?: Record<string, unknown>,
): RouteConfig {
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
    ...(extensions ? { extensions } : {}),
  };
}

/**
 * Create Bazaar discovery extensions for a POST endpoint.
 * Returns null if @x402/extensions is not available or validation fails.
 *
 * NOTE: declareDiscoveryExtension() omits `method` by design (filled by
 * enrichDeclaration at runtime), but the schema requires it. We pre-fill
 * method:"POST" so metadata passes standalone validation too.
 */
export function declareDiscovery(config: {
  input?: Record<string, unknown>;
  inputSchema?: Record<string, unknown>;
  outputExample?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}): Record<string, unknown> | null {
  try {
    const { declareDiscoveryExtension, validateDiscoveryExtension } =
      dynamicRequire("@x402/extensions/bazaar");
    const extensions = declareDiscoveryExtension({
      bodyType: "json" as const,
      input: config.input,
      inputSchema: config.inputSchema,
      output: {
        example: config.outputExample,
        schema: config.outputSchema,
      },
    });

    // Pre-fill HTTP method — enrichDeclaration normally sets this from
    // transport context at runtime, but standalone validation requires it
    for (const ext of Object.values(extensions)) {
      const e = ext as { info?: { input?: { method?: string } } };
      if (e?.info?.input && !e.info.input.method) {
        e.info.input.method = "POST";
      }
    }

    // Validate — return null on failure (graceful degradation)
    for (const ext of Object.values(extensions)) {
      const result = validateDiscoveryExtension(ext);
      if (!result.valid) {
        console.warn(
          "[x402] Bazaar discovery validation failed:",
          result.errors,
        );
        return null;
      }
    }

    return extensions;
  } catch {
    return null;
  }
}
