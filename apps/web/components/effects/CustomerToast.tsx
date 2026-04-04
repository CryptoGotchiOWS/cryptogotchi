"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { CustomerEvent } from "../../hooks/useAutoIncome";

interface CustomerToastProps {
  event: CustomerEvent | null;
}

interface ToastState {
  visible: boolean;
  serviceName: string;
  amount: number;
  timestamp: number;
}

const EMPTY_TOAST: ToastState = { visible: false, serviceName: "", amount: 0, timestamp: 0 };

export default function CustomerToast({ event }: CustomerToastProps) {
  const shouldReduceMotion = useReducedMotion();
  const [toast, setToast] = useState<ToastState>(EMPTY_TOAST);

  // On new event: schedule show + hide via setTimeout callbacks (no sync setState in effect body)
  useEffect(() => {
    if (!event) return;

    const showTimer = setTimeout(() => {
      setToast({
        visible: true,
        serviceName: event.serviceName,
        amount: event.amount,
        timestamp: event.timestamp,
      });
    }, 0);

    const hideTimer = setTimeout(() => {
      setToast(EMPTY_TOAST);
    }, 3000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [event]);

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            key={toast.timestamp}
            initial={shouldReduceMotion ? false : { opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="glass-panel rounded-xl px-4 py-3 border border-success/30 shadow-lg max-w-[260px]"
          >
            <p className="font-pixel text-[7px] text-success">
              NEW CUSTOMER!
            </p>
            <p className="text-xs text-charcoal mt-1">
              Used <span className="font-bold">{toast.serviceName}</span>
            </p>
            <p className="font-mono text-sm font-bold text-success mt-0.5">
              +${toast.amount.toFixed(2)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
