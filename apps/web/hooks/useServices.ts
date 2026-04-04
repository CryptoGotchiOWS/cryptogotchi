"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ServiceType, Transaction, ServiceResponse } from "@cryptogotchi/shared";
import { SERVICE_PRICES } from "@cryptogotchi/shared";

const TX_STORAGE_KEY = "cryptogotchi-transactions";

function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TX_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

function saveTransactions(txs: Transaction[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(txs.slice(0, 50)));
  } catch {
    // localStorage full
  }
}

interface ServiceState {
  isLoading: boolean;
  result: ServiceResponse | null;
  error: string | null;
  petReaction: string | null;
  reactionTimestamp: number;
}

const initialServiceState: ServiceState = {
  isLoading: false,
  result: null,
  error: null,
  petReaction: null,
  reactionTimestamp: 0,
};

export function useServices(onIncome: (amount: number) => void) {
  const [serviceStates, setServiceStates] = useState<Record<string, ServiceState>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Hydrate transactions from localStorage on mount
  // Phase: 0 = not started, 1 = dispatched, 2 = ready to persist
  const hydratePhaseRef = useRef(0);
  useEffect(() => {
    if (hydratePhaseRef.current !== 0) return;
    const saved = loadTransactions();
    if (saved.length > 0) {
      hydratePhaseRef.current = 1; // dispatch pending - don't persist yet
      setTransactions(saved);
    } else {
      hydratePhaseRef.current = 2; // no saved data, safe to persist
    }
  }, []);

  useEffect(() => {
    if (hydratePhaseRef.current === 0) return; // not hydrated yet
    if (hydratePhaseRef.current === 1) {
      // setTransactions was dispatched, this render has the restored data - now safe
      hydratePhaseRef.current = 2;
      return;
    }
    saveTransactions(transactions);
  }, [transactions]);

  const getServiceState = useCallback(
    (type: ServiceType): ServiceState => serviceStates[type] ?? initialServiceState,
    [serviceStates]
  );

  const callService = useCallback(
    async (type: ServiceType, body: Record<string, unknown>) => {
      setServiceStates((prev) => ({
        ...prev,
        [type]: { isLoading: true, result: null, error: null, petReaction: null, reactionTimestamp: 0 },
      }));

      const txId = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const price = SERVICE_PRICES[type] ?? "0.01";

      // Add pending transaction
      const pendingTx: Transaction = {
        id: txId,
        serviceType: type,
        amount: price,
        timestamp: Date.now(),
        status: "pending",
      };
      setTransactions((prev) => [pendingTx, ...prev]);

      try {
        const res = await fetch(`/api/services/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const data = (await res.json()) as ServiceResponse & { pet_reaction?: string };
        const petReaction = data.pet_reaction ?? null;

        setServiceStates((prev) => ({
          ...prev,
          [type]: { isLoading: false, result: data, error: null, petReaction, reactionTimestamp: Date.now() },
        }));

        // Update transaction to completed
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === txId ? { ...tx, status: "completed" as const } : tx))
        );

        // Process income
        onIncome(parseFloat(price));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setServiceStates((prev) => ({
          ...prev,
          [type]: { isLoading: false, result: null, error: message, petReaction: null, reactionTimestamp: 0 },
        }));

        // Update transaction to failed
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === txId ? { ...tx, status: "failed" as const } : tx))
        );
      }
    },
    [onIncome]
  );

  const clearResult = useCallback((type: ServiceType) => {
    setServiceStates((prev) => ({
      ...prev,
      [type]: initialServiceState,
    }));
  }, []);

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  }, []);

  return { callService, getServiceState, transactions, clearResult, addTransaction };
}
