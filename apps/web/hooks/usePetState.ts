"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import type { PetState, PetMood, BalanceState, PetActionEffect } from "@cryptogotchi/shared";
import {
  createInitialPetState,
  applyDecay,
  getMood,
  getBalanceState,
  processIncome as engineProcessIncome,
  applyCareAction as engineApplyCareAction,
} from "@cryptogotchi/pet-engine";

const STORAGE_KEY = "cryptogotchi-pet-state";

type Action =
  | { type: "DECAY" }
  | { type: "PROCESS_INCOME"; amount: number }
  | { type: "UPDATE_STATS"; payload: Partial<PetState> }
  | { type: "CARE_ACTION"; effects: PetActionEffect; cost: number }
  | { type: "REVIVE" }
  | { type: "SET_STATE"; payload: PetState };

function petReducer(state: PetState, action: Action): PetState {
  switch (action.type) {
    case "DECAY":
      return applyDecay(state);

    case "PROCESS_INCOME":
      return engineProcessIncome(state, action.amount);

    case "CARE_ACTION":
      return engineApplyCareAction(state, action.effects, action.cost);

    case "UPDATE_STATS":
      return { ...state, ...action.payload, lastUpdated: Date.now() };

    case "REVIVE": {
      const fresh = createInitialPetState(state.name);
      return {
        ...fresh,
        // Preserve progression but halve it as revive penalty
        level: Math.max(1, Math.floor(state.level / 2)),
        xp: Math.max(0, Math.floor(state.xp / 2)),
        // Grant a reduced starting balance (half of initial)
        balance: fresh.balance / 2,
      };
    }

    case "SET_STATE":
      return action.payload;

    default:
      return state;
  }
}

function loadState(): PetState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PetState;
  } catch {
    return null;
  }
}

function saveState(state: PetState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

export function usePetState() {
  // Always start with a deterministic initial state (avoids hydration mismatch)
  const [state, dispatch] = useReducer(
    petReducer,
    null,
    () => createInitialPetState("CryptoGotchi")
  );

  // Hydrate from localStorage on mount (client-only)
  // Phase: 0 = not started, 1 = dispatched, 2 = ready to persist
  const hydratePhaseRef = useRef(0);
  useEffect(() => {
    if (hydratePhaseRef.current !== 0) return;
    const saved = loadState();
    if (saved) {
      hydratePhaseRef.current = 1; // dispatch pending - don't persist yet
      dispatch({ type: "SET_STATE", payload: saved });
    } else {
      hydratePhaseRef.current = 2; // no saved state, safe to persist
    }
  }, []);

  // Persist to localStorage on every state change (only after hydration is settled)
  useEffect(() => {
    if (hydratePhaseRef.current === 0) return; // not hydrated yet
    if (hydratePhaseRef.current === 1) {
      // SET_STATE was dispatched, this render has the restored state - now safe
      hydratePhaseRef.current = 2;
      return;
    }
    saveState(state);
  }, [state]);

  // Decay interval: every second
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "DECAY" });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mood: PetMood = getMood(state);
  const balanceState: BalanceState = getBalanceState(state.balance);

  const processIncome = useCallback((amount: number) => {
    dispatch({ type: "PROCESS_INCOME", amount });
  }, []);

  const careAction = useCallback((effects: PetActionEffect, cost: number) => {
    dispatch({ type: "CARE_ACTION", effects, cost });
  }, []);

  const revive = useCallback(() => {
    dispatch({ type: "REVIVE" });
  }, []);

  return { state, mood, balanceState, dispatch, processIncome, careAction, revive };
}
