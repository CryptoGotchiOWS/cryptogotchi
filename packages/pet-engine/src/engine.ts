import type { PetState, PetMood } from "@cryptogotchi/shared";
import {
  DECAY_RATES,
  DEFAULT_DECAY_SPEED,
  DEFAULT_INITIAL_BALANCE,
  XP_PER_SERVICE,
  XP_PER_LEVEL,
} from "@cryptogotchi/shared";
import type { StatUpdate } from "./types";

export function createInitialPetState(name: string): PetState {
  const initialBalance =
    typeof globalThis?.process?.env?.NEXT_PUBLIC_INITIAL_BALANCE === "string"
      ? Number(process.env.NEXT_PUBLIC_INITIAL_BALANCE)
      : DEFAULT_INITIAL_BALANCE;

  return {
    name,
    hunger: 80,
    happiness: 80,
    energy: 80,
    health: 100,
    mood: "happy",
    level: 1,
    xp: 0,
    balance: initialBalance,
    lastUpdated: Date.now(),
  };
}

export function updateStats(state: PetState, updates: StatUpdate): PetState {
  const clamp = (val: number) => Math.max(0, Math.min(100, val));
  return {
    ...state,
    hunger: clamp(updates.hunger ?? state.hunger),
    happiness: clamp(updates.happiness ?? state.happiness),
    energy: clamp(updates.energy ?? state.energy),
    health: clamp(updates.health ?? state.health),
    lastUpdated: Date.now(),
  };
}

export function getMood(state: PetState): PetMood {
  const avg = (state.hunger + state.happiness + state.energy + state.health) / 4;
  if (state.health < 20) return "sick";
  if (state.hunger < 20) return "hungry";
  if (avg > 75) return "happy";
  if (avg > 50) return "neutral";
  if (avg > 25) return "sad";
  return "sick";
}

export function applyDecay(state: PetState): PetState {
  const now = Date.now();
  const minutesElapsed = (now - state.lastUpdated) / (1000 * 60);
  if (minutesElapsed < 0.1) return state;

  const speed =
    typeof globalThis?.process?.env?.NEXT_PUBLIC_STAT_DECAY_SPEED === "string"
      ? Number(process.env.NEXT_PUBLIC_STAT_DECAY_SPEED)
      : DEFAULT_DECAY_SPEED;

  const newState = updateStats(state, {
    hunger: state.hunger - DECAY_RATES.hunger * speed * minutesElapsed,
    happiness: state.happiness - DECAY_RATES.happiness * speed * minutesElapsed,
    energy: state.energy - DECAY_RATES.energy * speed * minutesElapsed,
    health: state.health - DECAY_RATES.health * speed * minutesElapsed,
  });

  return { ...newState, mood: getMood(newState) };
}

export function processIncome(state: PetState, amount: number): PetState {
  const newXp = state.xp + XP_PER_SERVICE;
  const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

  return {
    ...state,
    balance: state.balance + amount,
    xp: newXp,
    level: newLevel,
    happiness: Math.min(100, state.happiness + 5),
    mood: "excited",
    lastUpdated: Date.now(),
  };
}
