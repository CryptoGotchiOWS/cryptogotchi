"use client";

import type { Achievement } from "@cryptogotchi/shared";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface AchievementToastProps {
  achievement: Achievement | null;
}

const RARITY_STYLES: Record<string, string> = {
  common: "border-dusty-sage",
  rare: "border-peach-sand",
  epic: "border-purple-500",
  legendary: "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]",
};

export default function AchievementToast({ achievement }: AchievementToastProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          key={achievement.id}
          initial={shouldReduceMotion ? false : { opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`
            fixed top-4 left-1/2 -translate-x-1/2 z-[60]
            flex items-center gap-3 px-5 py-3
            bg-white/90 backdrop-blur-md rounded-xl
            border-2 ${RARITY_STYLES[achievement.rarity] ?? "border-sage-mist"}
          `}
        >
          <span className="text-2xl">{achievement.icon}</span>
          <div>
            <p className="font-pixel text-[8px] text-charcoal">{achievement.title}</p>
            <p className="text-[10px] text-dark-gray">{achievement.description}</p>
          </div>
          <span className="font-pixel text-[6px] uppercase text-dusty-sage ml-2">
            {achievement.rarity}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
