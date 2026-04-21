"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, X } from "lucide-react";
import confetti from "canvas-confetti";
import { useSession } from "@repo/auth/client";
import { useWaitlist } from "@/hooks/useWaitlist";

export default function AIReelsBanner() {
  const { data: session } = useSession();
  const [expanded, setExpanded] = useState(false);
  const { email, setEmail, loading, joined, submit } = useWaitlist({
    source: "DASHBOARD",
    defaultEmail: session?.user.email,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#3b82f6", "#8b5cf6", "#ffffff"],
      });
      setExpanded(false);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-accent/20">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, hsl(263 70% 8% / 1) 0%, hsl(217 91% 8% / 1) 100%)" }}
      />
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-accent/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-primary/10 blur-[60px] pointer-events-none" />

      <div className="relative p-6">
        {/* Top row — always visible */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground/90 mb-1">
                AI Reels is coming to your dashboard
              </p>
              <p className="text-xs text-muted-foreground/55 max-w-sm leading-relaxed">
                Automatically detect viral moments, export for TikTok, Reels &amp; Shorts — with captions.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
            {joined ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-green-400 border border-green-500/20 bg-green-500/[0.06]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                You&apos;re on the waitlist
              </span>
            ) : (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="group relative overflow-hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, hsl(263 70% 55%), hsl(217 91% 55%))",
                  boxShadow: "0 0 30px -8px hsl(263 70% 64% / 0.5)",
                }}
              >
                <span className="relative z-10">{expanded ? "Cancel" : "Join Waitlist"}</span>
                {expanded
                  ? <X className="relative z-10 w-3.5 h-3.5" />
                  : <ArrowRight className="relative z-10 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                }
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              </button>
            )}
            <p className="text-[11px] text-muted-foreground/35">Early access for Creator plan members</p>
          </div>
        </div>

        {/* Inline form — expands when "Join Waitlist" is clicked */}
        {expanded && !joined && (
          <form
            onSubmit={handleSubmit}
            className="mt-5 pt-5 border-t border-white/[0.06] flex items-center gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
              className="flex-1 min-w-0 bg-white/[0.03] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/40 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-60 transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, hsl(263 70% 55%), hsl(217 91% 55%))" }}
            >
              {loading ? "Saving..." : "Reserve Spot"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
