"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const STORAGE_KEY = "cryptogotchi-onboarding-done";

const STEPS = [
  {
    title: "Welcome, Operator!",
    description: "Your CryptoGotchi is an AI worker that earns crypto by serving customers. Your job? Keep it alive and happy.",
    icon: "\u{1F44B}",
  },
  {
    title: "Keep It Alive",
    description: "Feed, play, let it sleep, and give medicine when needed. If stats hit zero, your pet dies and loses progress!",
    icon: "\u2764\uFE0F",
  },
  {
    title: "Watch It Earn",
    description: "Customers arrive automatically and pay for AI services. The healthier your pet, the better it works. Ka-ching!",
    icon: "\u{1F4B0}",
  },
];

// Sync external store approach: read localStorage without setState in effect
function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getOnboardingDone(): boolean {
  if (typeof window === "undefined") return true; // SSR: assume done (no overlay)
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function getServerSnapshot(): boolean {
  return true; // SSR: no overlay
}

export default function OnboardingOverlay() {
  const isDone = useSyncExternalStore(subscribeToStorage, getOnboardingDone, getServerSnapshot);
  const [step, setStep] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    // Trigger storage event for useSyncExternalStore
    window.dispatchEvent(new Event("storage"));
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleDismiss();
    }
  };

  if (isDone) return null;

  const current = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 backdrop-blur-sm"
      >
        <motion.div
          key={step}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="glass-panel rounded-2xl p-8 max-w-sm mx-4 text-center border border-sage-mist/50 shadow-2xl"
        >
          <span className="text-4xl block mb-4">{current.icon}</span>

          <h2 className="font-pixel text-xs text-charcoal mb-3">
            {current.title}
          </h2>

          <p className="text-sm text-dark-gray leading-relaxed mb-6">
            {current.description}
          </p>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? "bg-caramel" : "bg-sage-mist"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleDismiss}
              className="font-pixel text-[7px] px-4 py-2 text-dark-gray hover:text-charcoal transition-colors cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="font-pixel text-[7px] px-6 py-2 bg-peach-sand text-warm-brown rounded-lg hover:bg-caramel hover:text-white transition-colors cursor-pointer"
            >
              {step < STEPS.length - 1 ? "Next" : "Let's Go!"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
