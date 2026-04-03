import type { ServiceConfig } from "./types";

export const NETWORK_CAIP2 = "eip155:84532"; // Base Sepolia
export const FACILITATOR_URL = "https://x402.org/facilitator";

export const SERVICE_PRICES: Record<string, string> = {
  summarize: "0.01",
  fortune: "0.01",
  "code-review": "0.02",
  crypto: "0.01",
};

export const SERVICES: ServiceConfig[] = [
  {
    type: "summarize",
    name: "AI Summarizer",
    description: "Summarize any text with AI precision",
    price: SERVICE_PRICES.summarize,
    icon: "scroll",
    tier: 1,
  },
  {
    type: "fortune",
    name: "Crypto Fortune",
    description: "Get your daily crypto fortune told",
    price: SERVICE_PRICES.fortune,
    icon: "sparkles",
    tier: 1,
  },
  {
    type: "code-review",
    name: "Code Review",
    description: "AI-powered code review assistant",
    price: SERVICE_PRICES["code-review"],
    icon: "code",
    tier: 2,
  },
  {
    type: "crypto",
    name: "Crypto Advisor",
    description: "Get crypto market insights",
    price: SERVICE_PRICES.crypto,
    icon: "coins",
    tier: 2,
  },
];

// Decay: "per minute" for demo speed. Multiplied by NEXT_PUBLIC_STAT_DECAY_SPEED env.
// At speed=3, pet loses ~9 hunger/min → fully hungry in ~9 minutes (great for demo).
export const DECAY_RATES = {
  hunger: 3,      // points per minute (base)
  happiness: 2,
  energy: 1.5,
  health: 0.5,
};

export const DEFAULT_DECAY_SPEED = 3; // env override: NEXT_PUBLIC_STAT_DECAY_SPEED
export const DEFAULT_INITIAL_BALANCE = 10; // env override: NEXT_PUBLIC_INITIAL_BALANCE

export const XP_PER_SERVICE = 10;
export const XP_PER_LEVEL = 100;
