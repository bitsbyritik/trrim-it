import type { Plan, PlanData } from "./mock-data";

// ── Three test scenarios ───────────────────────────────────────

export const FREE_PLAN_DATA: PlanData = {
  plan: "free",
  credits: null,
  minutesUsed: 8.2,
  minutesTotal: 10,
  clipsThisMonth: 4,
  clipsRemaining: 1,
  totalClipsEver: 12,
  overageAmount: 0,
  overageMinutes: 0,
  monthlyCost: 0,
  isLowCredits: false,
  isNearLimit: true, // 82%
};

export const PAYG_PLAN_DATA: PlanData = {
  plan: "payg",
  credits: 24.5,
  minutesUsed: 34,
  minutesTotal: null,
  clipsThisMonth: 8,
  clipsRemaining: null,
  totalClipsEver: 23,
  overageAmount: 0,
  overageMinutes: 0,
  monthlyCost: 340, // $3.40
  isLowCredits: false, // 24.5 >= 5
  isNearLimit: false,
};

export const PRO_PLAN_DATA: PlanData = {
  plan: "pro",
  credits: null,
  minutesUsed: 142,
  minutesTotal: 300,
  clipsThisMonth: 31,
  clipsRemaining: null,
  totalClipsEver: 156,
  overageAmount: 60, // $0.60
  overageMinutes: 12,
  monthlyCost: 1200, // $12.00 base
  isLowCredits: false,
  isNearLimit: false, // 47%
};

// Low-credits PAYG variant for testing the warning banner
export const PAYG_LOW_PLAN_DATA: PlanData = {
  ...PAYG_PLAN_DATA,
  credits: 2.3,
  isLowCredits: true,
};

const SCENARIOS: Record<Plan, PlanData> = {
  free: FREE_PLAN_DATA,
  payg: PAYG_PLAN_DATA,
  pro: PRO_PLAN_DATA,
};

export function getPlanData(plan: Plan): PlanData {
  return SCENARIOS[plan];
}

// ── PAYG credit history ────────────────────────────────────────

export type CreditHistoryEntry = {
  id: string;
  date: string;
  description: string;
  credits: number; // positive = purchase, negative = usage
  balanceAfter: number;
};

export const MOCK_CREDIT_HISTORY: CreditHistoryEntry[] = [
  { id: "ch1", date: "2026-04-14", description: "Trim: Product Demo Highlight (2.3 min)", credits: -2.3, balanceAfter: 24.5 },
  { id: "ch2", date: "2026-04-13", description: "Trim: Conference Talk Snippet (1.2 min)", credits: -1.2, balanceAfter: 26.8 },
  { id: "ch3", date: "2026-04-12", description: "Trim: Tutorial Clip (0.8 min)", credits: -0.8, balanceAfter: 28.0 },
  { id: "ch4", date: "2026-04-10", description: "Trim: Interview Extract (0.5 min)", credits: -0.5, balanceAfter: 28.8 },
  { id: "ch5", date: "2026-04-05", description: "Credit purchase — 30 min", credits: 30, balanceAfter: 29.3 },
];
