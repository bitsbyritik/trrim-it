import { CloudDownload, Crosshair, Zap, type LucideIcon } from "lucide-react";
import { TRIM } from "@/lib/copy";

const ICONS: LucideIcon[] = [CloudDownload, Crosshair, Zap];

export default function TrimFeatureSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        {/* Section label */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="h-px w-8 bg-primary/40" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-primary/70 uppercase">
            {TRIM.label}
          </span>
          <div className="h-px w-8 bg-primary/40" />
        </div>

        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {TRIM.headline_1}{" "}
            <span className="text-gradient-primary">{TRIM.headline_2}</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-sm mx-auto">
            {TRIM.subheadline}
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {TRIM.features.map((feat, i) => {
            const Icon = ICONS[i]!;
            return (
              <div
                key={feat.title}
                className="group relative rounded-2xl border border-white/[0.07] bg-card p-7 hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-300 overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,hsl(217_91%_60%/0.06),transparent_60%)]" />

                <div className="relative z-10">
                  <div className="w-11 h-11 mb-5 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/25 transition-all duration-300">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base mb-2 leading-snug">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
