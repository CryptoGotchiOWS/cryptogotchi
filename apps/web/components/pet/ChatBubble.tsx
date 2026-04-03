"use client";

import { useState, useEffect, useMemo } from "react";
import type { PetMood, BalanceState } from "@cryptogotchi/shared";
import { getRandomDialogue, getBalanceDialogue } from "@cryptogotchi/pet-engine";

interface ChatBubbleProps {
  mood: PetMood;
  balanceState: BalanceState;
  petReaction?: string | null;
}

export default function ChatBubble({ mood, balanceState, petReaction }: ChatBubbleProps) {
  const [tick, setTick] = useState(0);

  // Rotate dialogues every 5 seconds via interval (setState only in callback, not synchronously)
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Derive message purely from props + tick counter
  const message = useMemo(() => {
    if (petReaction) return petReaction;
    return tick % 2 === 0 ? getRandomDialogue(mood) : getBalanceDialogue(balanceState);
  }, [petReaction, tick, mood, balanceState]);

  return (
    <div className="chat-bubble max-w-[200px]">
      <p className="font-pixel text-[7px] leading-relaxed text-charcoal">
        {message}
      </p>
    </div>
  );
}
