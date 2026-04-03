/**
 * x402 Mock Payment Middleware
 *
 * Passthrough wrapper that simulates x402 payment flow.
 * Used when X402_MOCK=true (default) or x402 packages aren't installed.
 */

import { NextRequest, NextResponse } from "next/server";

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

interface MockPaymentConfig {
  price: string;
  description: string;
}

export function withMockPayment(
  handler: RouteHandler,
  config: MockPaymentConfig,
): RouteHandler {
  return async (req: NextRequest) => {
    const response = await handler(req);

    // Clone the response to add mock payment headers
    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "X-Payment-Status": "mock",
        "X-Payment-Amount": config.price,
        "X-Payment-Network": "eip155:84532",
        "X-Payment-Description": config.description,
      },
    });
  };
}
