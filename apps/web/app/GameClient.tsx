"use client";

import { useState, useEffect } from "react";
import type { ServiceType } from "@cryptogotchi/shared";
import { usePetState } from "../hooks/usePetState";
import { useServices } from "../hooks/useServices";
import PetScreen from "../components/pet/PetScreen";
import DeathScreen from "../components/pet/DeathScreen";
import StatsPanel from "../components/stats/StatsPanel";
import WalletInfo from "../components/stats/WalletInfo";
import ServiceShop from "../components/services/ServiceShop";
import Dashboard from "../components/dashboard/Dashboard";
import TransactionLog from "../components/dashboard/TransactionLog";

const REACTION_TYPES: ServiceType[] = ["summarize", "fortune", "code-review", "crypto"];
const REACTION_EXPIRY_MS = 8000;

/**
 * Tracks the most recent pet reaction across all services.
 * Auto-expires after 8 seconds so chat rotation resumes.
 * All Date.now() calls are inside effects/callbacks (not during render).
 */
function useLatestReaction(
  getServiceState: ReturnType<typeof useServices>["getServiceState"]
): string | null {
  const [reaction, setReaction] = useState<string | null>(null);

  // Poll for reaction changes + expiry (setState only inside interval callback)
  useEffect(() => {
    const interval = setInterval(() => {
      let bestReaction: string | null = null;
      let bestTs = 0;
      for (const t of REACTION_TYPES) {
        const s = getServiceState(t);
        if (s.petReaction && s.reactionTimestamp > bestTs) {
          bestReaction = s.petReaction;
          bestTs = s.reactionTimestamp;
        }
      }
      if (bestTs > 0 && Date.now() - bestTs > REACTION_EXPIRY_MS) {
        setReaction(null);
      } else {
        setReaction(bestReaction);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [getServiceState]);

  return reaction;
}

export default function GameClient() {
  const { state, mood, balanceState, processIncome, revive } = usePetState();
  const { callService, getServiceState, transactions, clearResult } = useServices(processIncome);

  const latestReaction = useLatestReaction(getServiceState);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-8 py-4 bg-white/40 border-b border-sage-mist/50">
        <h1 className="font-pixel text-sm sm:text-base text-charcoal">
          CryptoGotchi
        </h1>
        <WalletInfo state={state} balanceState={balanceState} />
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-8 py-6 flex flex-col gap-8 max-w-7xl mx-auto w-full">
        {/* Pet + Stats row */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
          <PetScreen mood={mood} balanceState={balanceState} petReaction={latestReaction} />
          <div className="w-full lg:w-64">
            <StatsPanel state={state} />
          </div>
        </div>

        {/* Services */}
        <ServiceShop
          callService={callService}
          getServiceState={getServiceState}
          clearResult={clearResult}
        />

        {/* Dashboard + Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Dashboard state={state} transactions={transactions} />
          <TransactionLog transactions={transactions} />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-[10px] text-dark-gray/60 font-mono">
        CryptoGotchi &mdash; OWS Hackathon 2026 &mdash; Powered by x402 + Gemini AI
      </footer>

      {/* Death overlay */}
      <DeathScreen visible={balanceState === "dead"} onRevive={revive} />
    </div>
  );
}
