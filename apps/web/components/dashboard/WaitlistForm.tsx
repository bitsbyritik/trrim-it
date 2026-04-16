"use client";

import { CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useWaitlist } from "@/hooks/useWaitlist";

type Props = {
  defaultEmail?: string;
};

export default function WaitlistForm({ defaultEmail = "" }: Props) {
  const {
    email, setEmail,
    notifyMe, setNotifyMe,
    foundingMember, setFoundingMember,
    loading, joined, submit,
  } = useWaitlist({ source: "DASHBOARD", defaultEmail });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#8b5cf6", "#ffffff"],
      });
    }
  };

  if (joined) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-green-400" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground/90">You&apos;re on the list.</p>
          <p className="text-sm text-muted-foreground/50 mt-1 max-w-xs">
            We&apos;ll reach out before anyone else when AI Reels launches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted-foreground/60 mb-1.5">
          Email address <span className="text-red-400/70">*</span>
        </label>
        <input
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
        className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-60 transition-all active:scale-[0.99]"
        style={{
          background: "linear-gradient(135deg, hsl(263 70% 55%), hsl(217 91% 55%))",
          boxShadow: "0 0 30px -8px hsl(263 70% 64% / 0.4)",
        }}
      >
        {loading ? "Reserving your spot..." : "Reserve My Spot"}
      </button>
    </form>
  );
}
