"use client";

import { useState, useEffect, useRef, useCallback, useReducer } from "react";
import type { AchievementId, PetState, ServiceType } from "@cryptogotchi/shared";
import { ACHIEVEMENTS } from "@cryptogotchi/shared";

const STORAGE_KEY = "cryptogotchi-achievements";

type AchievementRecord = Record<AchievementId, number | null>; // null = locked, number = unlock timestamp

const INITIAL: AchievementRecord = {
  newborn: null,
  "first-meal": null,
  "crypto-whisperer": null,
  "diamond-hands": null,
  survivor: null,
  maximalist: null,
};

type AchAction =
  | { type: "HYDRATE"; payload: AchievementRecord }
  | { type: "UNLOCK"; id: AchievementId; timestamp: number };

function achReducer(state: AchievementRecord, action: AchAction): AchievementRecord {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "UNLOCK":
      if (state[action.id] !== null) return state; // already unlocked
      return { ...state, [action.id]: action.timestamp };
    default:
      return state;
  }
}

function loadAchievements(): AchievementRecord {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    return { ...INITIAL, ...JSON.parse(raw) };
  } catch {
    return INITIAL;
  }
}

function persistAchievements(record: AchievementRecord): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch { /* */ }
}

interface UseAchievementsParams {
  state: PetState;
  totalCustomers: number;
  manualServiceTypes: ReadonlySet<ServiceType>;
  totalCareActions: number;
  hasRevived: boolean;
}

export function useAchievements({
  state,
  totalCustomers,
  manualServiceTypes,
  totalCareActions,
  hasRevived,
}: UseAchievementsParams) {
  const [achievements, dispatch] = useReducer(achReducer, INITIAL);
  const [latestUnlock, setLatestUnlock] = useState<AchievementId | null>(null);

  // Hydrate once (dispatch is not setState, passes lint)
  const hydrateRef = useRef(false);
  useEffect(() => {
    if (hydrateRef.current) return;
    hydrateRef.current = true;
    dispatch({ type: "HYDRATE", payload: loadAchievements() });
  }, []);

  // Persist on change (skip first 2 renders: initial + hydrate)
  const persistPhaseRef = useRef(0);
  useEffect(() => {
    if (persistPhaseRef.current < 2) {
      persistPhaseRef.current++;
      return;
    }
    persistAchievements(achievements);
  }, [achievements]);

  // Session start time (for time-based achievements)
  const sessionStartRef = useRef(0);
  useEffect(() => {
    sessionStartRef.current = Date.now();
  }, []);

  // Check achievements periodically
  const unlock = useCallback((id: AchievementId) => {
    const now = Date.now();
    dispatch({ type: "UNLOCK", id, timestamp: now });
    // The reducer returns same ref if already unlocked, so we check inside
    // We use a ref to track what we've notified about
    setLatestUnlock((prev) => {
      // Only set if the achievement wasn't previously unlocked
      return prev === id ? prev : id;
    });
  }, []);

  // Track what was already unlocked at load time to avoid false toasts
  const initialUnlocksRef = useRef<Set<AchievementId> | null>(null);
  useEffect(() => {
    if (initialUnlocksRef.current !== null) return;
    const loaded = loadAchievements();
    const set = new Set<AchievementId>();
    for (const [id, val] of Object.entries(loaded)) {
      if (val !== null) set.add(id as AchievementId);
    }
    initialUnlocksRef.current = set;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!initialUnlocksRef.current) return;

      const elapsed = sessionStartRef.current > 0
        ? (Date.now() - sessionStartRef.current) / 1000
        : 0;

      const tryUnlock = (id: AchievementId) => {
        if (achievements[id] !== null) return; // already done
        if (initialUnlocksRef.current?.has(id)) return; // was loaded from storage
        unlock(id);
      };

      // Newborn: 1 minute of play
      if (elapsed >= 60) tryUnlock("newborn");

      // Diamond Hands: 30 minutes
      if (elapsed >= 1800) tryUnlock("diamond-hands");

      // First Meal: at least 1 care action
      if (totalCareActions > 0) tryUnlock("first-meal");

      // Crypto Whisperer: manually tested all 4 service types
      const allUsed = (["summarize", "fortune", "code-review", "crypto"] as ServiceType[])
        .every((t) => manualServiceTypes.has(t));
      if (allUsed) tryUnlock("crypto-whisperer");

      // Survivor: died and revived
      if (hasRevived) tryUnlock("survivor");

      // Maximalist: all stats > 80
      if (
        state.hunger > 80 &&
        state.happiness > 80 &&
        state.energy > 80 &&
        state.health > 80
      ) {
        tryUnlock("maximalist");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state, totalCustomers, manualServiceTypes, totalCareActions, hasRevived, unlock, achievements]);

  // Auto-clear latest toast after 4s
  useEffect(() => {
    if (!latestUnlock) return;
    const timer = setTimeout(() => setLatestUnlock(null), 4000);
    return () => clearTimeout(timer);
  }, [latestUnlock]);

  const achievementList = ACHIEVEMENTS.map((a) => ({
    ...a,
    unlockedAt: achievements[a.id],
  }));

  return {
    achievements: achievementList,
    latestUnlock: latestUnlock ? ACHIEVEMENTS.find((a) => a.id === latestUnlock) ?? null : null,
  };
}
