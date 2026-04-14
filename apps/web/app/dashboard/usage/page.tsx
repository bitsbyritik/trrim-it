"use client";

import Link from "next/link";
import { Zap, TrendingDown, TrendingUp } from "lucide-react";
import UsageChart from "@/components/dashboard/UsageChart";
import BillingHistory from "@/components/dashboard/BillingHistory";
import UsageMeter from "@/components/ui/UsageMeter";
import { usePlan } from "@/hooks/usePlan";
import { MOCK_CREDIT_HISTORY } from "@/lib/mock-users";
import { getMockBilling } from "@/lib/mock-data";

const PLAN_BADGE: Record<string, string> = {
  free: "bg-white/[0.06] border-white/10 text-muted-foreground/70",
  payg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  pro:  "bg-primary/10 border-primary/20 text-primary",
};

// A static period for now (would come from API)
const PERIOD = { start: "2026-04-01", end: "2026-04-30" };

// Minimal daily usage shape for chart
const DAILY_USAGE = (() => {
  const entries = [];
  for (let d = 1; d <= 15; d++) {
    const day = String(d).padStart(2, "0");
    entries.push({
      date: `2026-04-${day}`,
      minutes: d % 3 === 0 ? 0 : parseFloat((Math.random() * 2.5).toFixed(1)),
      clips: d % 3 === 0 ? 0 : Math.floor(Math.random() * 3),
    });
  }
  return entries;
})();

export default function UsagePage() {
  const {
    plan,
    credits,
    minutesUsed,
    minutesTotal,
    overageAmount,
    overageMinutes,
    openBuyCredits,
  } = usePlan();

  const billing = getMockBilling();

  const periodLabel = `${new Date(PERIOD.start).toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${new Date(PERIOD.end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usage</h1>
          <p className="text-sm text-muted-foreground/50 mt-0.5">{periodLabel}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${PLAN_BADGE[plan] ?? PLAN_BADGE.free}`}>
          {plan} plan
        </span>
      </div>

      {/* PAYG: Credit balance card */}
      {plan === "payg" && (
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider">Credit Balance</p>
              <div className="flex items-baseline gap-2">
                <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-4xl font-extrabold tabular-nums text-cyan-300">
                  {(credits ?? 0).toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground/50">minutes remaining</span>
              </div>
              <p className="text-xs text-muted-foreground/40">
                ~{Math.floor((credits ?? 0) / 1.5)} short clips · $0.10/min
              </p>
            </div>
            <button
              onClick={openBuyCredits}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-95 shadow-[0_0_20px_-6px_hsl(188_90%_42%/0.4)]"
              style={{ background: "linear-gradient(135deg, hsl(188 90% 42%), hsl(217 91% 52%))" }}
            >
              <Zap className="w-4 h-4" />
              Top Up Credits
            </button>
          </div>

          {/* Credit history */}
          <div className="mt-6 pt-5 border-t border-cyan-500/10">
            <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3">Recent Transactions</p>
            <div className="space-y-1">
              {MOCK_CREDIT_HISTORY.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${entry.credits > 0 ? "bg-green-500/10" : "bg-white/[0.04]"}`}>
                    {entry.credits > 0
                      ? <TrendingUp className="w-3 h-3 text-green-400" />
                      : <TrendingDown className="w-3 h-3 text-muted-foreground/40" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/70 truncate">{entry.description}</p>
                    <p className="text-[10px] text-muted-foreground/35">{entry.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-semibold tabular-nums ${entry.credits > 0 ? "text-green-400" : "text-muted-foreground/55"}`}>
                      {entry.credits > 0 ? "+" : ""}{entry.credits.toFixed(1)} min
                    </p>
                    <p className="text-[10px] text-muted-foreground/30 tabular-nums">
                      bal: {entry.balanceAfter.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Free / Pro: Usage summary card */}
      {plan !== "payg" && (
        <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-extrabold tabular-nums text-gradient-primary">
                    {minutesUsed.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground/50">
                    / {minutesTotal ?? "∞"} min used
                  </span>
                </div>
                {minutesTotal != null && (
                  <p className="text-xs text-muted-foreground/40">
                    {(minutesTotal - minutesUsed).toFixed(1)} min remaining this billing period
                  </p>
                )}
              </div>
              <div className="max-w-sm">
                <UsageMeter used={minutesUsed} total={minutesTotal} unit="min" />
              </div>

              {plan === "pro" && (
                <p className="text-xs text-muted-foreground/40">
                  Overage rate: <span className="text-foreground/60">$0.05 / additional minute</span>
                  {overageMinutes > 0 && (
                    <span className="ml-3 text-amber-400 font-semibold">
                      {overageMinutes} min overage (${(overageAmount / 100).toFixed(2)})
                    </span>
                  )}
                </p>
              )}
            </div>

            {plan === "free" && (
              <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 max-w-xs">
                <p className="text-sm font-semibold text-foreground/80 mb-1">Unlock more quota</p>
                <p className="text-xs text-muted-foreground/50 mb-3 leading-relaxed">
                  Upgrade to Pro for 300 min/month or use Pay As You Go credits.
                </p>
                <Link
                  href="/dashboard/settings#billing"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-all"
                >
                  Upgrade Plan
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <UsageChart data={DAILY_USAGE} label="Daily usage — April 2026" />

      {/* Billing history */}
      <BillingHistory entries={billing} />
    </div>
  );
}
