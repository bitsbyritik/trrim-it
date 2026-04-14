"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, CreditCard, Flame } from "lucide-react";
import { PRICING_TIERS, PRICING_META, CREDITS_EXPLAINER, type PricingTier } from "@/lib/copy";

type Props = {
  onSignIn: () => void;
};

// ── Badge pill ─────────────────────────────────────────────────
function Badge({ tier }: { tier: PricingTier }) {
  if (!tier.badge) return null;

  if (tier.isComingSoon) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-accent/10 border border-accent/20 text-accent uppercase">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
        </span>
        {tier.badge}
      </span>
    );
  }

  if (tier.id === "pro") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-primary/15 border border-primary/25 text-primary uppercase">
        <Zap className="w-2.5 h-2.5" />
        {tier.badge}
      </span>
    );
  }

  if (tier.id === "payg") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-amber-500/15 border border-amber-500/25 text-amber-400 uppercase">
        <Flame className="w-2.5 h-2.5" />
        {tier.badge}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-white/[0.06] border border-white/10 text-muted-foreground/70 uppercase">
      {tier.badge}
    </span>
  );
}

// ── Price display ──────────────────────────────────────────────
function PriceDisplay({ tier, annual }: { tier: PricingTier; annual: boolean }) {
  if (tier.price === "COMING_SOON") {
    return (
      <div className="flex flex-col items-start gap-1 mb-1">
        <span className="px-3 py-1.5 rounded-lg text-sm font-bold tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase">
          Coming Soon
        </span>
      </div>
    );
  }

  const displayPrice =
    annual && tier.id === "pro" && tier.annualPrice ? tier.annualPrice : tier.price;

  const parts = displayPrice.split(" ");
  const mainPrice = parts[0] ?? displayPrice;
  const unit = parts.slice(1).join(" ");

  const priceColor =
    tier.id === "pro"
      ? "text-gradient-primary"
      : tier.id === "payg"
        ? "bg-clip-text text-transparent"
        : "text-foreground";

  const priceStyle =
    tier.id === "payg"
      ? { backgroundImage: "linear-gradient(135deg, hsl(38 92% 60%), hsl(25 95% 58%))" }
      : undefined;

  return (
    <div className="flex items-end gap-1 mb-1">
      <span
        className={`text-4xl sm:text-5xl font-extrabold leading-none tabular-nums tracking-tight ${priceColor}`}
        style={priceStyle}
      >
        {mainPrice}
      </span>
      {unit && (
        <span className="text-sm text-muted-foreground/60 mb-1 leading-none">{unit}</span>
      )}
    </div>
  );
}

// ── CTA Button ─────────────────────────────────────────────────
function CtaButton({ tier, onSignIn }: { tier: PricingTier; onSignIn: () => void }) {
  const base =
    "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.98]";

  if (tier.ctaVariant === "outline") {
    return (
      <button
        onClick={onSignIn}
        className={`${base} border border-white/15 text-foreground/80 hover:border-white/25 hover:bg-white/[0.04]`}
      >
        {tier.ctaLabel}
      </button>
    );
  }

  if (tier.ctaVariant === "gradient") {
    return (
      <a
        href="/waitlist"
        className={`${base} relative overflow-hidden border border-accent/30 text-accent hover:border-accent/50 hover:bg-accent/[0.06]`}
      >
        <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
        <Sparkles className="relative z-10 w-3.5 h-3.5" />
        <span className="relative z-10">{tier.ctaLabel}</span>
      </a>
    );
  }

  // solid — Pro gets primary blue, PAYG gets amber
  if (tier.id === "payg") {
    return (
      <button
        onClick={onSignIn}
        className={`${base} relative overflow-hidden text-white shadow-[0_0_28px_-6px_hsl(38_92%_60%/0.45)]`}
        style={{
          background: "linear-gradient(135deg, hsl(38 92% 52%), hsl(25 95% 50%))",
        }}
      >
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
        <span className="relative z-10">{tier.ctaLabel}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onSignIn}
      className={`${base} ${
        tier.id === "pro"
          ? "bg-primary hover:bg-primary/90 text-white shadow-[0_0_28px_-6px_hsl(217_91%_60%/0.55)]"
          : "bg-white/[0.08] hover:bg-white/[0.12] text-foreground border border-white/10"
      }`}
    >
      {tier.ctaLabel}
    </button>
  );
}

// ── Single pricing card ────────────────────────────────────────
function PricingCard({
  tier,
  annual,
  onSignIn,
}: {
  tier: PricingTier;
  annual: boolean;
  onSignIn: () => void;
}) {
  const isAiReels = tier.isComingSoon;
  const isPro = tier.id === "pro";
  const isPayg = tier.id === "payg";

  const cardInner = (
    <div
      data-tier={tier.id}
      data-coming-soon={isAiReels ? "true" : undefined}
      className={`relative flex flex-col h-full rounded-2xl p-6 sm:p-7 transition-all duration-300 overflow-hidden ${
        isAiReels
          ? "bg-[#0a0a0a]/90 backdrop-blur-sm"
          : isPayg
            ? "bg-[#0d0a06]/90 backdrop-blur-sm"
            : isPro
              ? "bg-card border border-primary/25 shadow-[0_0_60px_-15px_hsl(217_91%_60%/0.25)] hover:border-primary/40"
              : "bg-card border border-white/[0.07] hover:border-white/[0.12]"
      }`}
    >
      {/* Top accent line */}
      {isPro && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      )}
      {isPayg && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
      )}

      {/* Ambient glow for PAYG */}
      {isPayg && (
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/[0.07] blur-3xl pointer-events-none" />
      )}

      {/*
        Content wrapper — flex-1 so it stretches to fill card height,
        pushing the CTA button (sibling) to the very bottom.
        Opacity dimmed for AI Reels.
      */}
      <div className={`flex flex-col flex-1 ${isAiReels ? "opacity-70" : ""}`}>
        {/* Badge + label row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <span
            className={`text-sm font-semibold ${
              isAiReels
                ? "text-foreground/70"
                : isPayg
                  ? "text-amber-200/80"
                  : "text-foreground/90"
            }`}
          >
            {tier.label}
          </span>
          <Badge tier={tier} />
        </div>

        {/* Price */}
        <PriceDisplay tier={tier} annual={annual} />
        <p
          className={`text-xs mb-6 leading-relaxed ${
            isPayg ? "text-amber-200/40" : "text-muted-foreground/55"
          }`}
        >
          {tier.priceSub}
        </p>

        {/* Features — flex-1 expands to consume leftover height */}
        <ul className="flex-1 space-y-2.5 mb-6">
          {tier.features.map((f) => (
            <li
              key={f}
              className={`flex items-start gap-2.5 text-xs leading-relaxed ${
                isAiReels
                  ? "text-foreground/50"
                  : isPayg
                    ? "text-amber-100/60"
                    : "text-foreground/70"
              }`}
            >
              <Check
                className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                  isAiReels
                    ? "text-accent/50"
                    : isPayg
                      ? "text-amber-400/80"
                      : isPro
                        ? "text-primary"
                        : "text-muted-foreground/60"
                }`}
              />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA — always full opacity, naturally sits at card bottom */}
      <CtaButton tier={tier} onSignIn={onSignIn} />
    </div>
  );

  // PAYG — amber gradient border
  if (isPayg) {
    return (
      <div className="h-full p-px rounded-2xl bg-gradient-to-br from-amber-500/40 via-orange-500/20 to-yellow-500/25 shadow-[0_0_60px_-15px_hsl(38_92%_60%/0.25)]">
        {cardInner}
      </div>
    );
  }

  // AI Reels — purple→blue gradient border
  if (isAiReels) {
    return (
      <div className="h-full p-px rounded-2xl bg-gradient-to-br from-accent/40 via-primary/20 to-accent/30 shadow-[0_0_60px_-15px_hsl(263_70%_64%/0.3)]">
        {cardInner}
      </div>
    );
  }

  return cardInner;
}

// ── Credits explainer ──────────────────────────────────────────
function CreditsExplainer() {
  return (
    <div className="mt-16 pt-10 border-t border-white/[0.06]">
      <div className="flex items-center justify-center gap-2 mb-8">
        <CreditCard className="w-4 h-4 text-muted-foreground/40" />
        <span className="text-sm font-semibold text-muted-foreground/50">
          {CREDITS_EXPLAINER.headline}
        </span>
      </div>
      <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {CREDITS_EXPLAINER.items.map((item) => (
          <div key={item.title} className="text-center">
            <h4 className="text-sm font-semibold text-foreground/70 mb-1.5">{item.title}</h4>
            <p className="text-xs text-muted-foreground/50 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────
export default function Pricing({ onSignIn }: Props) {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container">
        {/* Section label */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="h-px w-8 bg-primary/40" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-primary/70 uppercase">
            {PRICING_META.label}
          </span>
          <div className="h-px w-8 bg-primary/40" />
        </div>

        {/* Headline */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            <span className="text-foreground/85">{PRICING_META.headline_1}</span>{" "}
            <span className="text-gradient-primary">{PRICING_META.headline_2}</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-sm mx-auto">
            {PRICING_META.subheadline}
          </p>
        </div>

        {/* Monthly / Annual toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span
            className={`text-sm font-medium transition-colors ${!annual ? "text-foreground/80" : "text-muted-foreground/40"}`}
          >
            Monthly
          </span>
          <button
            role="switch"
            aria-checked={annual}
            onClick={() => setAnnual((v) => !v)}
            className={`relative w-11 h-6 rounded-full border transition-all duration-200 ${
              annual ? "bg-primary/20 border-primary/30" : "bg-white/[0.06] border-white/10"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                annual ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${annual ? "text-foreground/80" : "text-muted-foreground/40"}`}
          >
            Annual
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/10 border border-green-500/20 text-green-400">
              Save 25%
            </span>
          </span>
        </div>

        {/* Cards grid — items-stretch ensures uniform row height */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 max-w-6xl mx-auto items-stretch">
          {PRICING_TIERS.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              annual={annual}
              onSignIn={onSignIn}
            />
          ))}
        </div>

        {/* Credits explainer */}
        <CreditsExplainer />
      </div>
    </section>
  );
}
