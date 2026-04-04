"use client";

import type { ServiceType } from "@cryptogotchi/shared";
import { SERVICES } from "@cryptogotchi/shared";
import ServiceCard from "./ServiceCard";

interface ServiceShopProps {
  callService: (type: ServiceType, body: Record<string, unknown>) => void;
  getServiceState: (type: ServiceType) => {
    isLoading: boolean;
    result: import("@cryptogotchi/shared").ServiceResponse | null;
    error: string | null;
    petReaction: string | null;
    reactionTimestamp: number;
  };
  clearResult: (type: ServiceType) => void;
  customersByService?: Record<ServiceType, number>;
}

export default function ServiceShop({
  callService,
  getServiceState,
  clearResult,
  customersByService,
}: ServiceShopProps) {
  return (
    <section>
      <h2 className="font-pixel text-[10px] text-warm-brown mb-4">YOUR PET&apos;S SERVICES</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SERVICES.map((service) => {
          const state = getServiceState(service.type);
          return (
            <ServiceCard
              key={service.type}
              service={service}
              isLoading={state.isLoading}
              result={state.result}
              error={state.error}
              petReaction={state.petReaction}
              onSubmit={callService}
              onClear={clearResult}
              customers={customersByService?.[service.type] ?? 0}
            />
          );
        })}
      </div>
    </section>
  );
}
