"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { ServiceType, PetAction } from "@cryptogotchi/shared";
import { usePetState } from "../hooks/usePetState";
import { useServices } from "../hooks/useServices";
import { useAutoIncome } from "../hooks/useAutoIncome";
import { usePetActions } from "../hooks/usePetActions";
import { useAudio } from "../hooks/useAudio";
import { useAchievements } from "../hooks/useAchievements";
import PetScreen from "../components/pet/PetScreen";
import PetActions from "../components/pet/PetActions";
import DeathScreen from "../components/pet/DeathScreen";
import StatsPanel from "../components/stats/StatsPanel";
import WalletInfo from "../components/stats/WalletInfo";
import ServiceShop from "../components/services/ServiceShop";
import Dashboard from "../components/dashboard/Dashboard";
import TransactionLog from "../components/dashboard/TransactionLog";
import CustomerToast from "../components/effects/CustomerToast";
import AchievementToast from "../components/effects/AchievementToast";
import OnboardingOverlay from "../components/onboarding/OnboardingOverlay";
import AudioToggle from "../components/ui/AudioToggle";

const REACTION_TYPES: ServiceType[] = ["summarize", "fortune", "code-review", "crypto"];
const REACTION_EXPIRY_MS = 8000;
const CUSTOMER_EVENT_WINDOW_MS = 5000;

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

const MOOD_BG_MAP: Record<string, string> = {
  happy: "mood-bg-happy",
  excited: "mood-bg-happy",
  neutral: "mood-bg-neutral",
  sad: "mood-bg-sad",
  hungry: "mood-bg-hungry",
  sick: "mood-bg-sick",
};

const ACTION_SOUNDS: Record<PetAction, "feed" | "play" | "sleep" | "medicine"> = {
  feed: "feed",
  play: "play",
  sleep: "sleep",
  medicine: "medicine",
};

export default function GameClient() {
  const { state, mood, balanceState, processIncome, careAction, revive } = usePetState();
  const { callService, getServiceState, transactions, clearResult, addTransaction } = useServices(processIncome);

  const isDead = balanceState === "dead";
  const autoIncome = useAutoIncome(processIncome, addTransaction, isDead);
  const { cooldowns, canPerform, performAction } = usePetActions({
    balance: state.balance,
    careAction,
  });

  const latestReaction = useLatestReaction(getServiceState);
  const { muted, toggleMute, play } = useAudio();

  // Track care actions + revive + manual service usage for achievements
  const [totalCareActions, setTotalCareActions] = useState(0);
  const [hasRevived, setHasRevived] = useState(false);
  const [manualServiceTypes, setManualServiceTypes] = useState<Set<ServiceType>>(new Set());

  // Wrap callService to track manual service types for achievements
  const callServiceTracked = useCallback(
    async (type: ServiceType, body: Record<string, unknown>) => {
      setManualServiceTypes((prev) => {
        if (prev.has(type)) return prev;
        const next = new Set(prev);
        next.add(type);
        return next;
      });
      return callService(type, body);
    },
    [callService],
  );

  // Wrap performAction to count + play SFX
  const performActionWithAudio = useCallback((type: PetAction) => {
    performAction(type);
    setTotalCareActions((prev) => prev + 1);
    play(ACTION_SOUNDS[type]);
  }, [performAction, play]);

  // Wrap revive to track + play SFX
  const reviveWithAudio = useCallback(() => {
    revive();
    setHasRevived(true);
    play("revive");
  }, [revive, play]);

  // Play death sound when pet dies
  const wasDead = useRef(false);
  useEffect(() => {
    if (isDead && !wasDead.current) {
      play("death");
    }
    wasDead.current = isDead;
  }, [isDead, play]);

  // Play customer arrival sound
  const prevCustomerCount = useRef(0);
  useEffect(() => {
    if (autoIncome.totalCustomers > prevCustomerCount.current && prevCustomerCount.current > 0) {
      play("customerArrival");
    }
    prevCustomerCount.current = autoIncome.totalCustomers;
  }, [autoIncome.totalCustomers, play]);

  // Achievements
  const { achievements, latestUnlock } = useAchievements({
    state,
    totalCustomers: autoIncome.totalCustomers,
    manualServiceTypes,
    totalCareActions,
    hasRevived,
  });

  // Play levelUp sound on achievement unlock
  useEffect(() => {
    if (latestUnlock) {
      play("levelUp");
    }
  }, [latestUnlock, play]);

  // Poll-based: derive hasRecentCustomer from a nowMs counter + lastEvent timestamp
  const [nowMs, setNowMs] = useState(0);
  useEffect(() => {
    const update = () => setNowMs(Date.now());
    const interval = setInterval(update, 1000);
    // Initial tick fires after 1s from the interval callback, not sync in effect body
    return () => clearInterval(interval);
  }, []);

  const hasRecentCustomer = useMemo(() => {
    if (!autoIncome.lastEvent || nowMs === 0) return false;
    return nowMs - autoIncome.lastEvent.timestamp < CUSTOMER_EVENT_WINDOW_MS;
  }, [nowMs, autoIncome.lastEvent]);

  const moodBgClass = MOOD_BG_MAP[mood] ?? "mood-bg-neutral";

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-1000 ${moodBgClass}`}>
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-8 py-4 bg-white/40 border-b border-sage-mist/50">
        <h1 className="font-pixel text-sm sm:text-base text-charcoal">
          CryptoGotchi
        </h1>
        <div className="flex items-center gap-3">
          <AudioToggle muted={muted} onToggle={toggleMute} />
          <WalletInfo state={state} balanceState={balanceState} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-8 py-6 flex flex-col gap-8 max-w-7xl mx-auto w-full">
        {/* Pet + Stats row */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <PetScreen
              mood={mood}
              balanceState={balanceState}
              petReaction={latestReaction}
              customerEvent={hasRecentCustomer}
            />
            <PetActions
              cooldowns={cooldowns}
              canPerform={canPerform}
              performAction={performActionWithAudio}
            />
          </div>
          <div className="w-full lg:w-64">
            <StatsPanel state={state} />
          </div>
        </div>

        {/* Services */}
        <ServiceShop
          callService={callServiceTracked}
          getServiceState={getServiceState}
          clearResult={clearResult}
          customersByService={autoIncome.customersByService}
        />

        {/* Dashboard + Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Dashboard
            state={state}
            transactions={transactions}
            totalCustomers={autoIncome.totalCustomers}
            achievements={achievements}
          />
          <TransactionLog transactions={transactions} />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-[10px] text-dark-gray/60 font-mono flex flex-col items-center gap-1">
        <span>CryptoGotchi &mdash; OWS Hackathon 2026</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sage-mist/40 text-dusty-sage">
          Powered by x402 + OWS + Gemini AI
        </span>
      </footer>

      {/* Customer toast */}
      <CustomerToast event={autoIncome.lastEvent} />

      {/* Achievement toast */}
      <AchievementToast achievement={latestUnlock} />

      {/* Onboarding overlay */}
      <OnboardingOverlay />

      {/* Death overlay */}
      <DeathScreen visible={isDead} onRevive={reviveWithAudio} />
    </div>
  );
}
