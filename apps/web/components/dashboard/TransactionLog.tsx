"use client";

import type { Transaction, ServiceType } from "@cryptogotchi/shared";

interface TransactionLogProps {
  transactions: Transaction[];
}

const SERVICE_ICONS: Record<ServiceType, string> = {
  summarize: "\uD83D\uDCDC",
  fortune: "\uD83D\uDD2E",
  "code-review": "\uD83D\uDCBB",
  crypto: "\uD83D\uDCB0",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-success/20 text-success",
  pending: "bg-warning/20 text-warning",
  failed: "bg-danger/20 text-danger",
};

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function TransactionLog({ transactions }: TransactionLogProps) {
  const recent = transactions.slice(0, 10);

  if (recent.length === 0) {
    return (
      <section>
        <h2 className="font-pixel text-[10px] text-warm-brown mb-4">TRANSACTIONS</h2>
        <p className="text-xs text-dark-gray/60 italic">No transactions yet. Try a service!</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-pixel text-[10px] text-warm-brown mb-4">TRANSACTIONS</h2>
      <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto custom-scrollbar">
        {recent.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2 text-xs"
          >
            <span className="text-base" role="img" aria-label={tx.serviceType}>
              {SERVICE_ICONS[tx.serviceType]}
            </span>
            <span className="font-mono text-charcoal flex-1 truncate capitalize">
              {tx.serviceType.replace("-", " ")}
            </span>
            <span className="font-mono font-bold text-success">+${tx.amount}</span>
            <span className="text-dark-gray/60 text-[10px]">{formatTime(tx.timestamp)}</span>
            <span
              className={`font-pixel text-[6px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[tx.status]}`}
            >
              {tx.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
