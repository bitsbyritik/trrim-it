import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  accent?: boolean;
  progress?: { value: number; max: number; color?: string };
};

export default function StatsCard({ label, value, sub, icon: Icon, accent, progress }: Props) {
  const pct = progress ? Math.min((progress.value / progress.max) * 100, 100) : 0;
  const barColor = progress?.color
    ?? (pct < 70 ? "bg-green-500" : pct < 90 ? "bg-amber-400" : "bg-red-500");

  return (
    <div className="group relative rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 overflow-hidden hover:border-white/[0.12] transition-all duration-300">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,hsl(217_91%_60%/0.05),transparent_60%)]" />

      <div className="relative flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? "bg-primary/10 border border-primary/15" : "bg-white/[0.04] border border-white/[0.06]"}`}>
          <Icon className={`${accent ? "text-primary" : "text-muted-foreground/45"}`} style={{ width: 14, height: 14 }} />
        </div>
      </div>

      <p className={`text-3xl font-extrabold tabular-nums leading-none mb-1 ${accent ? "text-gradient-primary" : "text-foreground"}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground/45 leading-relaxed">{sub}</p>

      {progress && (
        <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
