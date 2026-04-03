"use client";

import type { PetState } from "@cryptogotchi/shared";
import StatsBar from "./StatsBar";

interface StatsPanelProps {
  state: PetState;
}

export default function StatsPanel({ state }: StatsPanelProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white/60 rounded-xl">
      <h3 className="font-pixel text-[8px] text-warm-brown mb-1">STATS</h3>
      <StatsBar label="Hunger" value={state.hunger} icon="🍔" />
      <StatsBar label="Happy" value={state.happiness} icon="😊" />
      <StatsBar label="Energy" value={state.energy} icon="⚡" />
      <StatsBar label="Health" value={state.health} icon="❤️" />
    </div>
  );
}
