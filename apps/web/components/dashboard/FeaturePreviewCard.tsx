import type { LucideIcon } from "lucide-react";

type StatusChip = "In Development" | "Planned" | "Beta";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  status: StatusChip;
};

const STATUS_STYLES: Record<StatusChip, string> = {
  "In Development": "bg-amber-500/10 border-amber-500/20 text-amber-400",
  "Planned":        "bg-white/[0.05] border-white/10 text-muted-foreground/50",
  "Beta":           "bg-green-500/10 border-green-500/20 text-green-400",
};

export default function FeaturePreviewCard({ icon: Icon, title, description, status }: Props) {
  return (
    <div className="relative group rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 overflow-hidden">
      {/* Dimmed overlay — signals "coming soon" */}
      <div className="absolute inset-0 bg-background/30 pointer-events-none" />

      <div className="relative opacity-70">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-foreground/80 mb-2">{title}</h3>
        <p className="text-xs text-muted-foreground/55 leading-relaxed mb-4">{description}</p>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLES[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}
