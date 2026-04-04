"use client";

import { useState, useEffect, useRef } from "react";
import type { PetState, Transaction, Achievement } from "@cryptogotchi/shared";
import { DEFAULT_INITIAL_BALANCE } from "@cryptogotchi/shared";

interface AchievementDisplay extends Achievement {
  unlockedAt: number | null;
}

interface DashboardProps {
  state: PetState;
  transactions: Transaction[];
  totalCustomers?: number;
  achievements?: AchievementDisplay[];
}

export default function Dashboard({ state, transactions, totalCustomers = 0, achievements = [] }: DashboardProps) {
  const [aliveTime, setAliveTime] = useState("00:00:00");
  // Capture session start once on mount (inside effect to stay pure)
  const sessionStartRef = useRef(0);

  useEffect(() => {
    sessionStartRef.current = Date.now();
    const update = () => {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const s = String(elapsed % 60).padStart(2, "0");
      setAliveTime(`${h}:${m}:${s}`);
    };

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const completedTxs = transactions.filter((t) => t.status === "completed");
  const totalIncome = completedTxs.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const spent = Math.max(0, DEFAULT_INITIAL_BALANCE + totalIncome - state.balance);

  return (
    <section>
      <h2 className="font-pixel text-[10px] text-warm-brown mb-4">DASHBOARD</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Income" value={`$${totalIncome.toFixed(2)}`} color="text-success" />
        <MetricCard label="Spent" value={`$${spent.toFixed(2)}`} color="text-danger" />
        <MetricCard label="Customers" value={String(totalCustomers)} color="text-charcoal" />
        <MetricCard label="Session" value={aliveTime} color="text-dusty-sage" />
      </div>

      {/* Achievement badges */}
      {achievements.length > 0 && (
        <div className="mt-4">
          <h3 className="font-pixel text-[8px] text-dark-gray mb-2">ACHIEVEMENTS</h3>
          <div className="flex gap-2 flex-wrap">
            {achievements.map((a) => (
              <span
                key={a.id}
                title={a.unlockedAt ? `${a.title}: ${a.description}` : `??? ${a.description}`}
                className={`
                  text-xl cursor-default transition-opacity
                  ${a.unlockedAt ? "opacity-100" : "opacity-20 grayscale"}
                `}
              >
                {a.icon}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="glass-panel rounded-xl p-3 text-center">
      <p className="font-pixel text-[7px] text-dark-gray mb-1">{label}</p>
      <p className={`font-mono text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
