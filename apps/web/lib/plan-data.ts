import "server-only";
import { db, eq, and, desc, count } from "@repo/db";
import { subscriptions, creditLedger } from "@repo/db/schema";
import { monthlyUsage, clip } from "@repo/db/schema";
import type { Plan, PlanData } from "./mock-data";

const PLAN_LIMITS: Record<Plan, { minutesTotal: number | null; clipsPerMonth: number | null }> = {
  free: { minutesTotal: 10, clipsPerMonth: 5 },
  payg: { minutesTotal: null, clipsPerMonth: null },
  pro:  { minutesTotal: 300, clipsPerMonth: null },
};

export async function getUserPlanData(userId: string): Promise<PlanData> {
  const billingPeriod = new Date().toISOString().slice(0, 7);

  const [sub, usageRow, latestCreditRows, totalClipsRows] = await Promise.all([
    db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
      with: { plan: true },
    }),
    db.query.monthlyUsage.findFirst({
      where: and(
        eq(monthlyUsage.userId, userId),
        eq(monthlyUsage.billingPeriod, billingPeriod),
      ),
    }),
    db
      .select({ balanceAfter: creditLedger.balanceAfter })
      .from(creditLedger)
      .where(eq(creditLedger.userId, userId))
      .orderBy(desc(creditLedger.createdAt))
      .limit(1),
    db.select({ value: count() }).from(clip).where(eq(clip.userId, userId)),
  ]);

  // No subscription row = FREE (schema design: implicit default)
  const planType = (sub?.plan?.type?.toLowerCase() ?? "free") as Plan;
  const limits = PLAN_LIMITS[planType];

  const minutesUsed = usageRow?.totalCreditsUsed ?? 0;
  const clipsThisMonth = usageRow?.clipsDownloaded ?? 0;
  const totalClipsEver = totalClipsRows[0]?.value ?? 0;
  const creditBalance = latestCreditRows[0]?.balanceAfter ?? 0;

  const clipsRemaining =
    limits.clipsPerMonth !== null
      ? Math.max(0, limits.clipsPerMonth - clipsThisMonth)
      : null;

  const isNearLimit =
    limits.minutesTotal !== null ? minutesUsed / limits.minutesTotal > 0.8 : false;

  const isLowCredits = planType === "payg" && creditBalance < 5;

  return {
    plan: planType,
    credits: planType === "payg" ? creditBalance : null,
    minutesUsed,
    minutesTotal: limits.minutesTotal,
    clipsThisMonth,
    clipsRemaining,
    totalClipsEver,
    overageAmount: 0,
    overageMinutes: 0,
    monthlyCost: 0,
    isLowCredits,
    isNearLimit,
  };
}
