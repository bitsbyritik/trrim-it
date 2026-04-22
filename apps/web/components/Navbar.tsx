"use client";

import { useEffect, useState } from "react";
import { Scissors, Sparkles } from "lucide-react";

type Props = {
  onSignIn: () => void;
};

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="relative group px-3.5 py-1.5 rounded-full text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
  >
    <span className="relative z-10">{children}</span>
    <span className="absolute inset-0 rounded-full bg-white/[0.06] scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200" />
  </a>
);

export default function Navbar({ onSignIn }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-6 pt-4 pointer-events-none">
      {/* Wrapper — only max-width animates, via its own curve */}
      <div
        className="relative pointer-events-auto w-full p-px rounded-2xl"
        style={{
          maxWidth: scrolled ? "700px" : "980px",
          transition: "max-width 700ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Border layer 1 — resting state (always underneath) */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-white/[0.08]" />

        {/* Border layer 2 — scrolled state, fades in via opacity */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/45 via-white/[0.12] to-accent/45"
          style={{
            opacity: scrolled ? 1 : 0,
            transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Glow shadow layer — fades in separately */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            boxShadow: "0 8px 48px -12px hsl(217 91% 60% / 0.45)",
            opacity: scrolled ? 1 : 0,
            transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Inner content */}
        <div
          className="relative flex items-center justify-between px-4 py-2 rounded-2xl backdrop-blur-2xl"
          style={{
            backgroundColor: scrolled
              ? "rgba(6,6,6,0.93)"
              : "rgba(10,10,10,0.78)",
            transition: "background-color 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* ── Left: Logo ── */}
          <a href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center overflow-hidden group-hover:border-primary/55 transition-colors duration-200">
              <Scissors className="w-4 h-4 text-primary" />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-primary/30 to-transparent skew-x-12" />
            </div>
            <span className="text-[14px] font-bold tracking-tight whitespace-nowrap">
              trrim<span className="text-primary">.it</span>
            </span>
          </a>

          {/* ── Center: Nav links ── */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="#how-it-works">How it Works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>

            {/* AI Reels with badge */}
            <div className="relative group px-3.5 py-1.5 rounded-full text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-default select-none">
              <span className="relative z-10 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-accent/70" />
                AI Reels
              </span>
              <span className="absolute -top-2 -right-1 px-1.5 py-px rounded-full text-[9px] font-bold leading-none bg-amber-500/15 border border-amber-500/25 text-amber-400 whitespace-nowrap">
                Soon
              </span>
              <span className="absolute inset-0 rounded-full bg-white/[0.06] scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200" />
            </div>
          </div>

          {/* ── Right: CTA ── */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onSignIn}
              className="relative overflow-hidden flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-white text-[13px] font-semibold transition-all duration-150 shadow-[0_0_22px_-4px_hsl(217_91%_60%/0.7)] group cursor-pointer"
            >
              <span className="relative z-10 whitespace-nowrap">
                Get Started
              </span>
              <span className="relative z-10 text-white/60 group-hover:translate-x-0.5 transition-transform duration-150">
                →
              </span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
