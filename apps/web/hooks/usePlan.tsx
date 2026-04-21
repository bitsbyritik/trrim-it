"use client";

import { createContext, useContext, useState } from "react";
import type { Plan, PlanData } from "@/lib/mock-data";

export type PlanContextValue = PlanData & {
  openBuyCredits: () => void;
  closeBuyCredits: () => void;
  buyCreditsOpen: boolean;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({
  initialData,
  children,
}: {
  initialData: PlanData;
  children: React.ReactNode;
}) {
  const [data] = useState<PlanData>(initialData);
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);

  return (
    <PlanContext.Provider
      value={{
        ...data,
        openBuyCredits: () => setBuyCreditsOpen(true),
        closeBuyCredits: () => setBuyCreditsOpen(false),
        buyCreditsOpen,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan() must be used inside <PlanProvider>");
  return ctx;
}

// Re-export Plan type for convenience
export type { Plan };
