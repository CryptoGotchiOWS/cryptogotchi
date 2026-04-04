"use client";

import { useState, useEffect, useMemo } from "react";
import type { PetMood, BalanceState } from "@cryptogotchi/shared";
import { getRandomDialogue, getBalanceDialogue, getCustomerDialogue } from "@cryptogotchi/pet-engine";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface ChatBubbleProps {
  mood: PetMood;
  balanceState: BalanceState;
  petReaction?: string | null;
  customerEvent?: boolean;
}

export default function ChatBubble({ mood, balanceState, petReaction, customerEvent }: ChatBubbleProps) {
  const [tick, setTick] = useState(0);
  const shouldReduceMotion = useReducedMotion();

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
    if (customerEvent) return getCustomerDialogue();
    return tick % 2 === 0 ? getRandomDialogue(mood) : getBalanceDialogue(balanceState);
  }, [petReaction, customerEvent, tick, mood, balanceState]);

  return (
    <div className="chat-bubble max-w-[200px]">
      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="font-pixel text-[7px] leading-relaxed text-charcoal"
        >
          {message}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
