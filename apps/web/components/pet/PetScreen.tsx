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
    <div className="relative flex flex-col items-center">
      {/* Shell container - scales down on very small screens */}
      <div className="relative w-[240px] h-[330px] sm:w-[280px] sm:h-[380px]">
        {/* Shell background */}
        <div
          className="absolute inset-0 pixel-art bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/sprites/shell.png)" }}
        />

        {/* Screen area inside shell */}
        <div
          className={`
            absolute top-[60px] left-[40px] right-[40px] bottom-[120px]
            bg-sage-mist rounded-lg overflow-hidden
            lcd-scanlines ${glowClass}
            flex flex-col items-center justify-center gap-2
          `}
        >
          <ChatBubble mood={mood} balanceState={balanceState} petReaction={petReaction} customerEvent={customerEvent} />
          <Pet mood={mood} balanceState={balanceState} size={120} />
        </div>
      </div>
    </div>
  );
}
