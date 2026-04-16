"use client";

import { useState } from "react";
import { Sparkles, Smartphone, Type, ArrowRight, type LucideIcon } from "lucide-react";
import { AI_REELS } from "@/lib/copy";
import WaitlistModal from "@/components/WaitlistModal";

const ICONS: LucideIcon[] = [Sparkles, Smartphone, Type];

// Caption preview lines — visual demo, not from copy.ts (design asset)
const CAPTION_PREVIEW = [
  { time: "00:02", text: "Nobody saw this coming. Nobody." },
  { time: "00:05", text: "And then it just — happened." },
  { time: "00:09", text: "This is the clip everyone's talking about 🔥" },
];

export default function AIReelsSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section
      id="ai-reels"
      data-coming-soon="true"
      className="py-24 sm:py-32 relative overflow-hidden"
    >
      {/* Accent-dominant background glows — visually distinct from Trim sections */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-accent/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-[30%] right-[-5%] w-[300px] h-[300px] rounded-full bg-accent/8 blur-[100px]" />
      </div>

      <div className="container relative z-10">
        {/* ── Section label with pulse ── */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px w-8 bg-accent/40" />
          <div className="flex items-center gap-2">
            {/* Pulsing glow dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.2em] text-accent/80 uppercase">
              {AI_REELS.label}
            </span>
          </div>
          {/* COMING SOON badge */}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase">
            {AI_REELS.badge}
          </span>
          <div className="h-px w-8 bg-accent/40" />
        </div>

        {/* ── Headline ── */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
            <span className="text-foreground/85">{AI_REELS.headline_1}</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, hsl(263 70% 72%), hsl(217 91% 70%))",
              }}
            >
              {AI_REELS.headline_2}
            </span>
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
            {AI_REELS.subheadline}
          </p>
        </div>

        {/* ── Feature cards inside gradient-border wrapper ── */}
        <div className="max-w-5xl mx-auto mb-12">
          {/* Gradient border container */}
          <div className="p-px rounded-2xl bg-gradient-to-r from-accent/30 via-primary/15 to-accent/25">
            <div className="rounded-2xl bg-[#0a0a0a]/90 backdrop-blur-sm p-6 sm:p-8">
              <div className="grid sm:grid-cols-3 gap-5">
                {AI_REELS.features.map((feat, i) => {
                  const Icon = ICONS[i]!;
                  return (
                    <div
                      key={feat.title}
                      className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-accent/25 hover:bg-accent/[0.04] transition-all duration-300 overflow-hidden"
                    >
                      {/* Card hover glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,hsl(263_70%_64%/0.07),transparent_60%)]" />

                      <div className="relative z-10">
                        <div className="w-10 h-10 mb-4 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center group-hover:bg-accent/15 group-hover:border-accent/25 transition-all duration-300">
                          <Icon className="w-4.5 h-4.5 text-accent w-[18px] h-[18px]" />
                        </div>
                        {/* Text is subtly muted — signals coming-soon without being hidden */}
                        <h3 className="font-semibold text-sm mb-1.5 text-foreground/85 leading-snug">
                          {feat.title}
                        </h3>
                        <p className="text-xs text-muted-foreground/70 leading-relaxed">
                          {feat.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Auto-captions preview — visual demo asset */}
              <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/40 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                    Auto-captions preview
                  </span>
                </div>
                <div className="space-y-2.5">
                  {CAPTION_PREVIEW.map((line, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[11px] font-mono text-muted-foreground/35 shrink-0 mt-0.5 w-10 tabular-nums">
                        {line.time}
                      </span>
                      <span className="text-xs text-foreground/55 leading-relaxed">{line.text}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-accent/40 shrink-0 mt-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="group relative overflow-hidden inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-150 active:scale-95"
            style={{
              background: "linear-gradient(135deg, hsl(263 70% 55%), hsl(217 91% 55%))",
              boxShadow: "0 0 40px -8px hsl(263 70% 64% / 0.55)",
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="relative z-10">{AI_REELS.cta}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
          </button>
          <p className="text-xs text-muted-foreground/40">{AI_REELS.cta_sub}</p>
        </div>
      </div>

      <WaitlistModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
