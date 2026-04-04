"use client";

import type { PetAction } from "@cryptogotchi/shared";
import { PET_ACTIONS } from "@cryptogotchi/shared";
import { motion } from "motion/react";

interface PetActionsProps {
  cooldowns: Record<PetAction, number>;
  canPerform: (type: PetAction) => boolean;
  performAction: (type: PetAction) => void;
}

export default function PetActions({ cooldowns, canPerform, performAction }: PetActionsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-[320px]">
      {PET_ACTIONS.map((action) => {
        const onCooldown = cooldowns[action.type] > 0;
        const disabled = !canPerform(action.type);

        return (
          <motion.button
            key={action.type}
            onClick={() => performAction(action.type)}
            disabled={disabled}
            whileTap={disabled ? undefined : { scale: 0.9 }}
            className={`
              relative flex flex-col items-center gap-1 p-2 rounded-xl
              font-pixel text-[7px] transition-colors cursor-pointer
              ${disabled
                ? "bg-fog-gray/60 text-dark-gray/40 cursor-not-allowed"
                : "bg-white/80 text-charcoal hover:bg-peach-sand/60 active:bg-peach-sand"
              }
              border border-sage-mist/50
            `}
          >
            <span className="text-base">{action.icon}</span>
            <span>{action.label}</span>

            {action.cost > 0 && (
              <span className="text-[6px] text-warm-brown">${action.cost.toFixed(2)}</span>
            )}

            {onCooldown && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-charcoal/30">
                <span className="font-mono text-xs text-white font-bold">
                  {cooldowns[action.type]}s
                </span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
