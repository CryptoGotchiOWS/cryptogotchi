"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import type { ServiceType, Transaction } from "@cryptogotchi/shared";
import {
  SERVICES,
  AUTO_INCOME_INTERVAL_MIN,
  AUTO_INCOME_INTERVAL_MAX,
} from "@cryptogotchi/shared";

export interface CustomerEvent {
  serviceName: string;
  serviceType: ServiceType;
  amount: number;
  timestamp: number;
}

interface AutoIncomeState {
  lastEvent: CustomerEvent | null;
  totalCustomers: number;
  customersByService: Record<ServiceType, number>;
}

const STORAGE_KEY = "cryptogotchi-auto-income";

const INITIAL_STATE: AutoIncomeState = {
  lastEvent: null,
  totalCustomers: 0,
  customersByService: {
    summarize: 0,
    fortune: 0,
    "code-review": 0,
    crypto: 0,
  },
};

// --- localStorage persistence via useSyncExternalStore ---
let listeners: Array<() => void> = [];

function subscribe(callback: () => void) {
  listeners = [...listeners, callback];
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function getSnapshot(): AutoIncomeState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as AutoIncomeState;
    // lastEvent is ephemeral, don't restore from storage
    return { ...parsed, lastEvent: null };
  } catch {
    return INITIAL_STATE;
  }
}

function getServerSnapshot(): AutoIncomeState {
  return INITIAL_STATE;
}

function persistState(state: AutoIncomeState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full
  }
}

function emitChange() {
  for (const l of listeners) l();
}

function randomInterval(): number {
  const min = AUTO_INCOME_INTERVAL_MIN * 1000;
  const max = AUTO_INCOME_INTERVAL_MAX * 1000;
  return min + Math.random() * (max - min);
}

function randomService() {
  return SERVICES[Math.floor(Math.random() * SERVICES.length)];
}

export function useAutoIncome(
  processIncome: (amount: number) => void,
  addTransaction: (tx: Transaction) => void,
  isDead: boolean,
) {
  // Persisted counters (totalCustomers, customersByService) survive refresh
  const persisted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Ephemeral lastEvent for toast (not persisted)
  const [lastEvent, setLastEvent] = useState<CustomerEvent | null>(null);

  // Merge persisted counters into a combined state ref for the timer
  const stateRef = useRef<AutoIncomeState>({ ...persisted, lastEvent: null });

  // Keep refs in sync (only in effects)
  const processIncomeRef = useRef(processIncome);
  useEffect(() => { processIncomeRef.current = processIncome; }, [processIncome]);

  const addTransactionRef = useRef(addTransaction);
  useEffect(() => { addTransactionRef.current = addTransaction; }, [addTransaction]);

  // Self-scheduling timer managed entirely inside a single effect
  useEffect(() => {
    if (isDead) return;

    let timerId: ReturnType<typeof setTimeout> | null = null;

    function tick() {
      const service = randomService();
      const amount = parseFloat(service.price);
      const now = Date.now();

      // 1. Process income on pet state (balance + xp)
      processIncomeRef.current(amount);

      // 2. Create real transaction
      const tx: Transaction = {
        id: `auto-${now}-${Math.random().toString(36).slice(2, 6)}`,
        serviceType: service.type,
        amount: service.price,
        timestamp: now,
        status: "completed",
      };
      addTransactionRef.current(tx);

      // 3. Update customer metrics + persist
      const prev = stateRef.current;
      const nextState: AutoIncomeState = {
        lastEvent: {
          serviceName: service.name,
          serviceType: service.type,
          amount,
          timestamp: now,
        },
        totalCustomers: prev.totalCustomers + 1,
        customersByService: {
          ...prev.customersByService,
          [service.type]: (prev.customersByService[service.type] ?? 0) + 1,
        },
      };
      stateRef.current = nextState;
      persistState(nextState);
      emitChange();

      // 4. Ephemeral toast event
      setLastEvent(nextState.lastEvent);

      timerId = setTimeout(tick, randomInterval());
    }

    // Sync stateRef with latest persisted data on (re)start
    stateRef.current = { ...persisted, lastEvent: null };

    timerId = setTimeout(tick, randomInterval());

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isDead, persisted]);

  return {
    lastEvent,
    totalCustomers: persisted.totalCustomers,
    customersByService: persisted.customersByService,
  };
}
