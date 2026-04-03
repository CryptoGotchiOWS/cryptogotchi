"use client";

import { useState, useEffect, useRef } from "react";
import type { PetState, Transaction } from "@cryptogotchi/shared";

interface DashboardProps {
  state: PetState;
  transactions: Transaction[];
}

export default function Dashboard({ state, transactions }: DashboardProps) {
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
  const initialBalance = 10; // matches DEFAULT_INITIAL_BALANCE
  const spent = Math.max(0, initialBalance + totalIncome - state.balance);

  return (
    <section>
      <h2 className="font-pixel text-[10px] text-warm-brown mb-4">DASHBOARD</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Income" value={`$${totalIncome.toFixed(2)}`} color="text-success" />
        <MetricCard label="Spent" value={`$${spent.toFixed(2)}`} color="text-danger" />
        <MetricCard label="TXs" value={String(completedTxs.length)} color="text-charcoal" />
        <MetricCard label="Session" value={aliveTime} color="text-dusty-sage" />
      </div>
    </section>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/60 rounded-xl p-3 text-center">
      <p className="font-pixel text-[7px] text-dark-gray mb-1">{label}</p>
      <p className={`font-mono text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
