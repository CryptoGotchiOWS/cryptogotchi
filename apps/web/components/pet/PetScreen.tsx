"use client";

import type { PetMood, BalanceState } from "@cryptogotchi/shared";
import Pet from "./Pet";
import ChatBubble from "./ChatBubble";

interface PetScreenProps {
  mood: PetMood;
  balanceState: BalanceState;
  petReaction?: string | null;
  customerEvent?: boolean;
}

export default function PetScreen({ mood, balanceState, petReaction, customerEvent }: PetScreenProps) {
  const glowClass =
    balanceState === "thriving"
      ? "glow-thriving"
      : balanceState === "normal"
        ? "glow-normal"
        : balanceState === "struggling"
          ? "glow-struggling"
          : balanceState === "dying"
            ? "glow-dying"
            : "glow-dead";

  return (
    <div className="relative flex flex-col items-center gap-2">
      <ChatBubble mood={mood} balanceState={balanceState} petReaction={petReaction} customerEvent={customerEvent} />
      <div className={`${glowClass} rounded-full`}>
        <Pet mood={mood} balanceState={balanceState} size={160} />
      </div>
    </div>
  );
}
