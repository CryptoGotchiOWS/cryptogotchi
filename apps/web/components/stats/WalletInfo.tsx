"use client";

import type { PetState, BalanceState } from "@cryptogotchi/shared";
import { XP_PER_LEVEL } from "@cryptogotchi/shared";

interface WalletInfoProps {
  state: PetState;
  balanceState: BalanceState;
}

const BADGE_COLORS: Record<BalanceState, string> = {
  thriving: "bg-success text-white",
  normal: "bg-dusty-sage text-white",
  struggling: "bg-warning text-white",
  dying: "bg-danger text-white",
  dead: "bg-charcoal text-white",
};

export default function WalletInfo({ state, balanceState }: WalletInfoProps) {
  const xpInLevel = state.xp % XP_PER_LEVEL;
  const xpPercent = (xpInLevel / XP_PER_LEVEL) * 100;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Operator identity */}
      <div className="font-pixel text-[7px] text-dusty-sage bg-white/60 px-3 py-1.5 rounded-lg">
        OPERATOR
      </div>

      {/* Balance */}
      <div className="font-mono text-sm font-bold text-charcoal">
        ${state.balance.toFixed(2)}
      </div>

      {/* Balance state badge */}
      <span
        className={`font-pixel text-[7px] px-2 py-1 rounded-full ${BADGE_COLORS[balanceState]}`}
      >
        {balanceState.toUpperCase()}
      </span>

      {/* Level + XP */}
      <div className="flex items-center gap-2">
        <span className="font-pixel text-[8px] text-warm-brown">LV{state.level}</span>
        <div className="w-16 h-1.5 bg-sage-mist rounded-full overflow-hidden">
          <div
            className="h-full bg-caramel rounded-full stat-bar-fill"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
