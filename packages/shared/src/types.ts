export type PetMood = "happy" | "neutral" | "sad" | "hungry" | "sick" | "excited";

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
