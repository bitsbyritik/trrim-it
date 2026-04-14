"use client";

import { createContext, useContext, useState } from "react";
import type { Plan, PlanData } from "@/lib/mock-data";
import { getPlanData } from "@/lib/mock-users";

// ── Context value shape ────────────────────────────────────────

export type PlanContextValue = PlanData & {
  openBuyCredits: () => void;
  closeBuyCredits: () => void;
  buyCreditsOpen: boolean;
  /** Only non-null in development — drives the sidebar plan switcher */
  devSetPlan: ((p: Plan) => void) | null;
};

const PlanContext = createContext<PlanContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────

export function PlanProvider({
  initialData,
  children,
}: {
  initialData: PlanData;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<PlanData>(initialData);
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);

  const devSetPlan: ((p: Plan) => void) | null =
    process.env.NODE_ENV !== "production"
      ? (p) => setData(getPlanData(p))
      : null;

  return (
    <PlanContext.Provider
      value={{
        ...data,
        openBuyCredits: () => setBuyCreditsOpen(true),
        closeBuyCredits: () => setBuyCreditsOpen(false),
        buyCreditsOpen,
        devSetPlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan() must be used inside <PlanProvider>");
  return ctx;
}
