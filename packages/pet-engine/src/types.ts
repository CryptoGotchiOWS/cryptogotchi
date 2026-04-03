import type { PetState, PetMood } from "@cryptogotchi/shared";

export interface StatUpdate {
  hunger?: number;
  happiness?: number;
  energy?: number;
  health?: number;
}

export interface MoodRule {
  condition: (state: PetState) => boolean;
  mood: PetMood;
  priority: number;
}

export interface IncomeEvent {
  amount: number;
  xp: number;
  timestamp: number;
}
