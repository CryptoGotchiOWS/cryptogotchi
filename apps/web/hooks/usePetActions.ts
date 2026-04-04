"use client";

import { useState, useEffect, useCallback } from "react";
import type { PetAction, PetActionEffect } from "@cryptogotchi/shared";
import { PET_ACTIONS } from "@cryptogotchi/shared";

interface UsePetActionsOptions {
  balance: number;
  careAction: (effects: PetActionEffect, cost: number) => void;
}

export function usePetActions({ balance, careAction }: UsePetActionsOptions) {
  const [cooldowns, setCooldowns] = useState<Record<PetAction, number>>({
    feed: 0,
    play: 0,
    sleep: 0,
    medicine: 0,
  });

  // Tick cooldowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const key of Object.keys(next) as PetAction[]) {
          if (next[key] > 0) {
            next[key] = Math.max(0, next[key] - 1);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const canPerform = useCallback(
    (type: PetAction): boolean => {
      const config = PET_ACTIONS.find((a) => a.type === type);
      if (!config) return false;
      if (cooldowns[type] > 0) return false;
      if (config.cost > 0 && balance < config.cost) return false;
      return true;
    },
    [cooldowns, balance],
  );

  const performAction = useCallback(
    (type: PetAction) => {
      const config = PET_ACTIONS.find((a) => a.type === type);
      if (!config || !canPerform(type)) return;

      careAction(config.effects, config.cost);
      setCooldowns((prev) => ({ ...prev, [type]: config.cooldown }));
    },
    [canPerform, careAction],
  );

  return { cooldowns, canPerform, performAction };
}
