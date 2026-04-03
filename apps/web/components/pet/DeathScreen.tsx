"use client";

import { useMemo } from "react";
import { getBalanceDialogue } from "@cryptogotchi/pet-engine";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface DeathScreenProps {
  visible: boolean;
  onRevive: () => void;
}

export default function DeathScreen({ visible, onRevive }: DeathScreenProps) {
  const shouldReduceMotion = useReducedMotion();
  const dialogue = useMemo(
    () => (visible ? getBalanceDialogue("dead") : ""),
    [visible]
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Pet has died"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <motion.div
            initial={shouldReduceMotion ? false : { scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { scale: 0.8, y: 20 }}
            className="flex flex-col items-center gap-6 p-8 bg-fog-gray rounded-xl max-w-sm mx-4"
          >
            {/* Dead sprite */}
            <div
              className="w-[160px] h-[160px] pixel-art"
              style={{
                backgroundImage: "url(/sprites/dead.png)",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            />

            <h2 className="font-pixel text-sm text-danger text-center">
              F in the chat
            </h2>

            <p className="font-pixel text-[7px] text-dark-gray text-center leading-relaxed">
              {dialogue}
            </p>

            <button
              onClick={onRevive}
              className="
                font-pixel text-[10px] px-6 py-3
                bg-success text-white rounded-lg
                hover:brightness-110 active:scale-95
                transition-all cursor-pointer
              "
            >
              New Life ($5)
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
