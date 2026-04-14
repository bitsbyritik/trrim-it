"use client";

import { useState } from "react";
import { ArrowRight, Zap, Globe, Shield, Sparkles, type LucideIcon } from "lucide-react";
import { HERO } from "@/lib/copy";

const TRUST_ICONS: LucideIcon[] = [Zap, Shield, Globe];

export default function HeroSection() {
  const [url, setUrl] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary/15 blur-[160px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-accent/12 blur-[140px]" />
        <div className="absolute top-[40%] left-[-5%] w-[300px] h-[300px] rounded-full bg-primary/8 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container relative z-10 text-center px-4">
        {/* Eyebrow pill */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-muted-foreground backdrop-blur-sm animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
          {HERO.eyebrow}
        </div>

        {/* Main headline — dual promise */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-[88px] font-extrabold tracking-tight leading-[1.04] mb-6 animate-fade-in-up"
          style={{ animationDelay: "0.05s" }}
        >
          {HERO.headline_1}
          <br />
          <span className="text-gradient-primary">{HERO.headline_2}</span>
        </h1>

        {/* Subheadline */}
        <p
          className="max-w-xl mx-auto text-lg sm:text-xl text-muted-foreground mb-12 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "0.15s" }}
        >
          {HERO.subheadline}
        </p>

        {/* ── Primary CTA: URL input ── */}
        <div
          className="max-w-3xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="input-glow-container relative flex items-center gap-2 p-2 rounded-2xl border border-white/[0.09] bg-white/[0.03] backdrop-blur-sm transition-all duration-300">
            <div className="flex items-center flex-1 gap-3 pl-3 min-w-0">
              <Globe className="w-5 h-5 text-muted-foreground/60 shrink-0" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={HERO.input_placeholder}
                className="flex-1 min-w-0 bg-transparent text-base sm:text-lg text-foreground placeholder:text-muted-foreground/40 outline-none py-3"
              />
            </div>
            <button className="shrink-0 flex items-center gap-2 px-5 sm:px-7 py-3.5 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-white font-semibold text-sm sm:text-base transition-all duration-150 shadow-[0_0_28px_-6px_hsl(217_91%_60%/0.7)]">
              <span>{HERO.cta_primary}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trust micro-copy */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4">
            {HERO.trust.map((text, i) => {
              const Icon = TRUST_ICONS[i]!;
              return (
                <span key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                  <Icon className="w-3.5 h-3.5 text-primary/50" />
                  {text}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── Secondary CTA: AI Reels pill ── */}
        <div
          className="mt-6 flex justify-center animate-fade-in-up"
          style={{ animationDelay: "0.35s" }}
        >
          <a
            href="#ai-reels"
            className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-accent/25 bg-accent/[0.06] hover:bg-accent/10 hover:border-accent/40 transition-all duration-200"
          >
            {/* Subtle glow behind pill */}
            <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <Sparkles className="relative z-10 w-3.5 h-3.5 text-accent" />
            <span className="relative z-10 text-sm font-medium text-foreground/80">
              {HERO.cta_ai_label}
            </span>
            <span className="relative z-10 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-accent/15 border border-accent/25 text-accent">
              {HERO.cta_ai_badge}
            </span>
            <ArrowRight className="relative z-10 w-3.5 h-3.5 text-accent/50 group-hover:translate-x-0.5 transition-transform duration-150" />
          </a>
        </div>

        {/* Supported platforms */}
        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-2.5 animate-fade-in-up"
          style={{ animationDelay: "0.45s" }}
        >
          <span className="text-xs text-muted-foreground/40 mr-1">Works with</span>
          {HERO.platforms.map((p) => (
            <span
              key={p}
              className="px-3 py-1 rounded-full text-xs font-medium text-muted-foreground/50 border border-white/[0.06] bg-white/[0.02]"
            >
              {p}
            </span>
          ))}
          <span className="text-xs text-muted-foreground/40 ml-1">&amp; more</span>
        </div>
      </div>
    </section>
  );
}
