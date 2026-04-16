"use client";

import { useEffect, useRef } from "react";
import { Sparkles, X, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useWaitlist } from "@/hooks/useWaitlist";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultEmail?: string;
  source?: "DASHBOARD" | "LANDING";
};

export default function WaitlistModal({ open, onClose, defaultEmail, source = "LANDING" }: Props) {
  const { email, setEmail, notifyMe, setNotifyMe, foundingMember, setFoundingMember, loading, joined, submit } =
    useWaitlist({ source, defaultEmail });

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus email input when modal opens
  useEffect(() => {
    if (open && !joined) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open, joined]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.55 },
        colors: ["#3b82f6", "#8b5cf6", "#ffffff"],
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-accent/25 bg-[#0f0f0f] shadow-[0_0_80px_-20px_hsl(263_70%_64%/0.35)] overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full bg-accent/10 blur-[60px] pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground/80 hover:bg-white/[0.06] transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative p-8">
          {joined ? (
            // ── Success state ──
            <div className="flex flex-col items-center text-center py-4 gap-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground/90 mb-1">You&apos;re on the list.</p>
                <p className="text-sm text-muted-foreground/55 max-w-xs">
                  We&apos;ll reach out before anyone else when AI Reels launches.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-foreground/70 hover:border-white/20 hover:text-foreground/90 transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            // ── Form ──
            <>
              <div className="flex flex-col items-center text-center mb-7">
                <div className="relative inline-flex mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-accent/10 blur-xl animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-foreground/90 mb-1">
                  Get early access to AI Reels
                </h2>
                <p className="text-sm text-muted-foreground/55">
                  Auto-detect viral moments. Export for every platform. Captions included.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground/60 mb-1.5">
                    Email address <span className="text-red-400/70">*</span>
                  </label>
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/[0.03] border border-[#1f1f1f] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/40 transition-colors"
                  />
                </div>

                <div className="space-y-2.5">
                  {[
                    { id: "notify", label: "Notify me when AI Reels launches", value: notifyMe, set: setNotifyMe },
                    { id: "founding", label: "I want founding member pricing", value: foundingMember, set: setFoundingMember },
                  ].map(({ id, label, value, set }) => (
                    <label key={id} className="flex items-center gap-3 cursor-pointer group">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={value}
                        onClick={() => set(!value)}
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                          value ? "bg-primary border-primary" : "border-white/20 bg-white/[0.03] group-hover:border-white/30"
                        }`}
                      >
                        {value && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <span className="text-sm text-foreground/65">{label}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white disabled:opacity-60 transition-all active:scale-[0.99] mt-2"
                  style={{
                    background: "linear-gradient(135deg, hsl(263 70% 55%), hsl(217 91% 55%))",
                    boxShadow: "0 0 30px -8px hsl(263 70% 64% / 0.4)",
                  }}
                >
                  {loading ? "Reserving your spot..." : "Reserve My Spot"}
                </button>

                <p className="text-center text-xs text-muted-foreground/35">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
