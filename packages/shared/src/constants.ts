import type { ServiceConfig, PetActionConfig, Achievement } from "./types";

export const NETWORK_CAIP2 = "eip155:84532"; // Base Sepolia
export const FACILITATOR_URL = "https://x402.org/facilitator";

export const SERVICE_PRICES: Record<string, string> = {
  summarize: "0.50",
  fortune: "0.50",
  "code-review": "1.00",
  crypto: "0.50",
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

export const DEFAULT_DECAY_SPEED = 6; // env override: NEXT_PUBLIC_STAT_DECAY_SPEED
export const DEFAULT_INITIAL_BALANCE = 10; // env override: NEXT_PUBLIC_INITIAL_BALANCE

export const XP_PER_SERVICE = 10;
export const XP_PER_LEVEL = 100;

export const PET_ACTIONS: PetActionConfig[] = [
  {
    type: "feed",
    label: "Feed",
    icon: "🍖",
    cost: 0.50,
    cooldown: 5,
    effects: { hunger: 30 },
  },
  {
    type: "play",
    label: "Play",
    icon: "🎾",
    cost: 0,
    cooldown: 8,
    effects: { happiness: 20, energy: -10 },
  },
  {
    type: "sleep",
    label: "Sleep",
    icon: "💤",
    cost: 0,
    cooldown: 10,
    effects: { energy: 30, hunger: -10 },
  },
  {
    type: "medicine",
    label: "Medicine",
    icon: "💊",
    cost: 1.00,
    cooldown: 20,
    effects: { health: 40 },
  },
];

export const AUTO_INCOME_INTERVAL_MIN = 8; // seconds
export const AUTO_INCOME_INTERVAL_MAX = 20; // seconds

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "newborn",
    title: "Newborn",
    description: "Play for 1 minute",
    icon: "\uD83D\uDC23",
    rarity: "common",
  },
  {
    id: "first-meal",
    title: "First Meal",
    description: "Perform your first care action",
    icon: "\uD83C\uDF56",
    rarity: "common",
  },
  {
    id: "crypto-whisperer",
    title: "Crypto Whisperer",
    description: "Test all 4 service types",
    icon: "\uD83D\uDD2E",
    rarity: "rare",
  },
  {
    id: "diamond-hands",
    title: "Diamond Hands",
    description: "Play for 30 minutes",
    icon: "\uD83D\uDC8E",
    rarity: "rare",
  },
  {
    id: "survivor",
    title: "Survivor",
    description: "Die and revive",
    icon: "\uD83D\uDC80",
    rarity: "epic",
  },
  {
    id: "maximalist",
    title: "Maximalist",
    description: "All stats above 80%",
    icon: "\uD83D\uDC51",
    rarity: "legendary",
  },
];
