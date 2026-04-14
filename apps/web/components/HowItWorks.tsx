import { Link2, Scissors, CloudDownload, type LucideIcon } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/copy";

const ICONS: LucideIcon[] = [Link2, Scissors, CloudDownload];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="container">
        {/* Section label */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="h-px w-8 bg-white/10" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-muted-foreground/50 uppercase">
            {HOW_IT_WORKS.label}
          </span>
          <div className="h-px w-8 bg-white/10" />
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {HOW_IT_WORKS.headline}{" "}
            <span className="text-gradient-primary">{HOW_IT_WORKS.headline_accent}</span>
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto text-base">
            {HOW_IT_WORKS.subheadline}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 relative max-w-4xl mx-auto">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {HOW_IT_WORKS.steps.map((step, i) => {
            const Icon = ICONS[i]!;
            // Step 2 gets an accent treatment (it mentions AI)
            const isAiStep = i === 1;
            return (
              <div
                key={step.step}
                className={`group relative rounded-2xl border p-8 text-center transition-all duration-300 ${
                  isAiStep
                    ? "border-accent/15 bg-accent/[0.03] hover:border-accent/30 hover:bg-accent/[0.05]"
                    : "border-white/[0.07] bg-card hover:border-primary/25 hover:bg-primary/[0.03]"
                }`}
              >
                <span className="absolute top-5 right-6 text-xs font-mono font-bold text-muted-foreground/20 tabular-nums">
                  {step.step}
                </span>
                <div
                  className={`w-16 h-16 mx-auto mb-6 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
                    isAiStep
                      ? "bg-accent/[0.08] border-accent/10 group-hover:bg-accent/15 group-hover:border-accent/20"
                      : "bg-primary/[0.08] border-primary/10 group-hover:bg-primary/15 group-hover:border-primary/20"
                  }`}
                >
                  <Icon className={`w-7 h-7 ${isAiStep ? "text-accent" : "text-primary"}`} />
                </div>
                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                {/* AI badge on step 2 */}
                {isAiStep && (
                  <span className="inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    AI-powered soon
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
