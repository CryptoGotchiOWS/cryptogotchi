"use client";

import { useState, useEffect, useRef, useCallback, useReducer } from "react";
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

interface Counters {
  totalCustomers: number;
  customersByService: Record<ServiceType, number>;
}

const STORAGE_KEY = "cryptogotchi-auto-income";

const INITIAL_COUNTERS: Counters = {
  totalCustomers: 0,
  customersByService: {
    summarize: 0,
    fortune: 0,
    "code-review": 0,
    crypto: 0,
  },
};

type CounterAction =
  | { type: "HYDRATE"; payload: Counters }
  | { type: "INCREMENT"; serviceType: ServiceType };

function counterReducer(state: Counters, action: CounterAction): Counters {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "INCREMENT":
      return {
        totalCustomers: state.totalCustomers + 1,
        customersByService: {
          ...state.customersByService,
          [action.serviceType]: (state.customersByService[action.serviceType] ?? 0) + 1,
        },
      };
    default:
      return state;
  }
}

function loadFromStorage(): Counters {
  if (typeof window === "undefined") return INITIAL_COUNTERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_COUNTERS;
    const parsed = JSON.parse(raw);
    return {
      totalCustomers: parsed.totalCustomers ?? 0,
      customersByService: { ...INITIAL_COUNTERS.customersByService, ...parsed.customersByService },
    };
  } catch {
    return INITIAL_COUNTERS;
  }
}

function persistCounters(counters: Counters): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
  } catch {
    // localStorage full
  }
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
  const [counters, dispatch] = useReducer(counterReducer, INITIAL_COUNTERS);
  const [lastEvent, setLastEvent] = useState<CustomerEvent | null>(null);

  // Hydrate once on mount (dispatch is not setState, passes lint)
  const hydrateRef = useRef(false);
  useEffect(() => {
    if (hydrateRef.current) return;
    hydrateRef.current = true;
    dispatch({ type: "HYDRATE", payload: loadFromStorage() });
  }, []);

  // Persist counters when they change (skip initial render)
  const persistPhaseRef = useRef(0);
  useEffect(() => {
    if (persistPhaseRef.current < 2) {
      persistPhaseRef.current++;
      return;
    }
    persistCounters(counters);
  }, [counters]);

  // Refs for timer callbacks
  const processIncomeRef = useRef(processIncome);
  useEffect(() => { processIncomeRef.current = processIncome; }, [processIncome]);

  const addTransactionRef = useRef(addTransaction);
  useEffect(() => { addTransactionRef.current = addTransaction; }, [addTransaction]);

  // Stable callback used by timer
  const handleTick = useCallback(() => {
    const service = randomService();
    const amount = parseFloat(service.price);
    const now = Date.now();

    processIncomeRef.current(amount);

    const tx: Transaction = {
      id: `auto-${now}-${Math.random().toString(36).slice(2, 6)}`,
      serviceType: service.type,
      amount: service.price,
      timestamp: now,
      status: "completed",
    };
    addTransactionRef.current(tx);

    const event: CustomerEvent = {
      serviceName: service.name,
      serviceType: service.type,
      amount,
      timestamp: now,
    };

    setLastEvent(event);
    dispatch({ type: "INCREMENT", serviceType: service.type });
  }, []);

  // Self-scheduling timer — depends ONLY on isDead
  useEffect(() => {
    if (isDead) return;

    let timerId: ReturnType<typeof setTimeout> | null = null;

    function schedule() {
      timerId = setTimeout(() => {
        handleTick();
        schedule();
      }, randomInterval());
    }

    schedule();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isDead, handleTick]);

  return {
    lastEvent,
    totalCustomers: counters.totalCustomers,
    customersByService: counters.customersByService,
  };
}
