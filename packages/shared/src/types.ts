export type PetMood = "happy" | "neutral" | "sad" | "hungry" | "sick" | "excited";

export type PetAction = "feed" | "play" | "sleep" | "medicine";

export interface PetActionEffect {
  hunger?: number;
  happiness?: number;
  energy?: number;
  health?: number;
}

export interface PetActionConfig {
  type: PetAction;
  label: string;
  icon: string;
  cost: number;
  cooldown: number; // seconds
  effects: PetActionEffect;
}

export type BalanceState = "thriving" | "normal" | "struggling" | "dying" | "dead";

export interface PetState {
  name: string;
  hunger: number;      // 0-100
  happiness: number;   // 0-100
  energy: number;      // 0-100
  health: number;      // 0-100
  mood: PetMood;
  level: number;
  xp: number;
  balance: number;     // earned crypto balance
  lastUpdated: number; // timestamp
}

export type ServiceType = "summarize" | "fortune" | "code-review" | "crypto";

export interface ServiceConfig {
  type: ServiceType;
  name: string;
  description: string;
  price: string;       // USD amount as string
  icon: string;
  tier: 1 | 2;        // Tier 1: full, Tier 2: mock/simple
}

export interface Transaction {
  id: string;
  serviceType: ServiceType;
  amount: string;
  timestamp: number;
  status: "pending" | "completed" | "failed";
  txHash?: string;
}

// --- API Request/Response types ---

export interface SummarizeRequest {
  text: string;
}

export interface SummarizeResponse {
  summary: string;
  pet_reaction: string;
}

export interface FortuneRequest {
  wallet_address?: string;
}

export interface FortuneResponse {
  fortune: string;
  lucky_token: string;
  pet_reaction: string;
}

export interface CodeReviewRequest {
  code: string;
  language?: string;
}

export interface CodeReviewResponse {
  review: string;
  score: number;
  pet_reaction: string;
}

export interface CryptoRequest {
  query: string;
}

export interface CryptoResponse {
  analysis: string;
  sentiment: string;
  pet_reaction: string;
}

export type ServiceRequest =
  | SummarizeRequest
  | FortuneRequest
  | CodeReviewRequest
  | CryptoRequest;

export type ServiceResponse =
  | SummarizeResponse
  | FortuneResponse
  | CodeReviewResponse
  | CryptoResponse;
