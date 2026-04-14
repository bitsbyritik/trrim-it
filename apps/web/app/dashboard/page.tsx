import { redirect } from "next/navigation";
import { Scissors, Clock, Zap } from "lucide-react";
import { getSession } from "@/lib/dummy-auth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import QuickTrim from "@/components/dashboard/QuickTrim";

// ── Stat card ──────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="relative rounded-2xl border border-white/[0.07] bg-card p-5 overflow-hidden group hover:border-white/[0.12] transition-all duration-300">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,hsl(217_91%_60%/0.05),transparent_60%)]" />
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wider">
          {label}
        </span>
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? "bg-primary/10 border border-primary/15" : "bg-white/[0.04] border border-white/[0.06]"}`}
        >
          <Icon className={`w-3.5 h-3.5 ${accent ? "text-primary" : "text-muted-foreground/50"}`} />
        </div>
      </div>
      <p className={`text-3xl font-extrabold tabular-nums leading-none mb-1 ${accent ? "text-gradient-primary" : "text-foreground"}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground/45">{sub}</p>
    </div>
  );
}

// ── Empty clips state ──────────────────────────────────────────
function RecentClips() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
        Recent Clips
      </h2>
      <div className="rounded-2xl border border-white/[0.07] bg-card">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.05]">
          {["Source", "Duration", "Created", "Status"].map((h) => (
            <span key={h} className="text-[11px] font-semibold text-muted-foreground/35 uppercase tracking-wider">
              {h}
            </span>
          ))}
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
            <Scissors className="w-6 h-6 text-muted-foreground/25" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground/50">No clips yet</p>
            <p className="text-xs text-muted-foreground/35 mt-1">
              Paste a video URL above to create your first clip.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const firstName = session.name.split(" ")[0] ?? session.name;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav session={session} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Ready to trim? Paste a URL below or check your recent clips.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Clips this month"
            value="0"
            sub="of 5 on free tier"
            icon={Scissors}
          />
          <StatCard
            label="Minutes processed"
            value="0"
            sub="of 10 min quota"
            icon={Clock}
          />
          <StatCard
            label="Credits"
            value="10"
            sub="free trial credits"
            icon={Zap}
            accent
          />
        </div>

        {/* Quick trim */}
        <QuickTrim />

        {/* Recent clips */}
        <RecentClips />
      </main>
    </div>
  );
}
