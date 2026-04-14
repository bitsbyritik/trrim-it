import Link from "next/link";
import { Scissors, Clock, Zap, Film, Plus } from "lucide-react";
import { getSession } from "@/lib/dummy-auth";
import { getMockClips, getMockUsage } from "@/lib/mock-data";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentClipsTable from "@/components/dashboard/RecentClipsTable";
import QuickTrimWidget from "@/components/dashboard/QuickTrimWidget";
import AIReelsBanner from "@/components/dashboard/AIReelsBanner";

function greeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${time}, ${name.split(" ")[0]}`;
}

export default async function DashboardPage() {
  const session = await getSession();
  const usage = getMockUsage();
  const { clips } = getMockClips(5);

  const usagePct = (usage.minutesUsed / usage.minutesTotal) * 100;

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-8">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground/50 mt-0.5">
            {session ? greeting(session.name) : "Welcome back"}
          </p>
        </div>
        <Link
          href="/dashboard/trim"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-white font-semibold text-sm transition-all shadow-[0_0_20px_-6px_hsl(217_91%_60%/0.5)]"
        >
          <Plus style={{ width: 15, height: 15 }} />
          New Trim
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Clips this month"
          value={String(usage.clipsThisMonth)}
          sub={`${usage.clipsRemaining} remaining on ${usage.plan} plan`}
          icon={Scissors}
        />
        <StatsCard
          label="Minutes used"
          value={`${usage.minutesUsed.toFixed(1)}`}
          sub={`of ${usage.minutesTotal} min this month`}
          icon={Clock}
          progress={{ value: usage.minutesUsed, max: usage.minutesTotal }}
        />
        <StatsCard
          label={usage.plan === "payg" ? "Credits balance" : usage.plan === "pro" ? "Overage this month" : "Free plan"}
          value={
            usage.plan === "payg"
              ? `${usage.creditsBalance} min`
              : usage.plan === "pro"
                ? `$${(usage.overageAmount / 100).toFixed(2)}`
                : "10 min"
          }
          sub={
            usage.plan === "free"
              ? "Upgrade for more quota"
              : usage.plan === "payg"
                ? "Pre-purchased credits"
                : "Overage at $0.05/min"
          }
          icon={Zap}
          accent
        />
        <StatsCard
          label="Total clips ever"
          value={String(usage.totalClipsEver)}
          sub="Since you joined"
          icon={Film}
        />
      </div>

      {/* Quick trim */}
      <QuickTrimWidget />

      {/* Recent clips */}
      <RecentClipsTable clips={clips} />

      {/* AI Reels banner */}
      <AIReelsBanner />
    </div>
  );
}
