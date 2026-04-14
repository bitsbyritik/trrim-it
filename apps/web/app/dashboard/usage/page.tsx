import Link from "next/link";
import { getMockUsage, getMockBilling } from "@/lib/mock-data";
import UsageChart from "@/components/dashboard/UsageChart";
import BillingHistory from "@/components/dashboard/BillingHistory";
import UsageMeter from "@/components/ui/UsageMeter";

const PLAN_BADGE: Record<string, string> = {
  free: "bg-white/[0.06] border-white/10 text-muted-foreground/70",
  payg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  pro:  "bg-primary/10 border-primary/20 text-primary",
};

export default function UsagePage() {
  const usage = getMockUsage();
  const billing = getMockBilling();

  const periodLabel = `${new Date(usage.period.start).toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${new Date(usage.period.end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usage</h1>
          <p className="text-sm text-muted-foreground/50 mt-0.5">{periodLabel}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${PLAN_BADGE[usage.plan] ?? PLAN_BADGE.free}`}>
          {usage.plan} plan
        </span>
      </div>

      {/* Usage summary card */}
      <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-extrabold tabular-nums text-gradient-primary">
                  {usage.minutesUsed.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground/50">
                  / {usage.minutesTotal} min used
                </span>
              </div>
              <p className="text-xs text-muted-foreground/40">
                {(usage.minutesTotal - usage.minutesUsed).toFixed(1)} min remaining this billing period
              </p>
            </div>
            <div className="max-w-sm">
              <UsageMeter used={usage.minutesUsed} total={usage.minutesTotal} unit="min" />
            </div>

            {usage.plan === "pro" && (
              <p className="text-xs text-muted-foreground/40">
                Overage rate: <span className="text-foreground/60">$0.05 / additional minute</span>
              </p>
            )}
            {usage.plan === "payg" && (
              <p className="text-xs text-muted-foreground/40">
                Credit balance: <span className="text-cyan-400 font-semibold">{usage.creditsBalance} min</span>
                <button className="ml-3 text-xs text-primary hover:underline">Buy more →</button>
              </p>
            )}
          </div>

          {usage.plan === "free" && (
            <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 max-w-xs">
              <p className="text-sm font-semibold text-foreground/80 mb-1">Unlock more quota</p>
              <p className="text-xs text-muted-foreground/50 mb-3 leading-relaxed">
                Upgrade to Pro for 300 min/month or use Pay As You Go credits.
              </p>
              <Link
                href="#pricing"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-all"
              >
                Upgrade Plan
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <UsageChart data={usage.dailyUsage} label="Daily usage — April 2026" />

      {/* Billing history */}
      <BillingHistory entries={billing} />
    </div>
  );
}
