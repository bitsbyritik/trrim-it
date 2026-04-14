"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

const STORAGE_KEY = "trrim_waitlisted";

type Props = {
  defaultEmail?: string;
  userId?: string;
};

export default function WaitlistForm({ defaultEmail = "", userId = "" }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [notifyMe, setNotifyMe] = useState(true);
  const [founding, setFounding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(
    typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true"
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email."); return; }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email, options: { notifyMe, foundingMember: founding } }),
      });
      const json = (await res.json()) as { data: { success: boolean } | null; error: string | null };
      if (!res.ok || !json.data?.success) {
        setError(json.error ?? "Something went wrong. Try again.");
        return;
      }
      localStorage.setItem(STORAGE_KEY, "true");
      setSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#8b5cf6", "#ffffff"],
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-white/[0.03] border border-[#1f1f1f] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/40 transition-colors"
          required
        />
      </div>

      <div className="space-y-2.5">
        {[
          { id: "notify", label: "Notify me when AI Reels launches", state: notifyMe, set: setNotifyMe },
          { id: "founding", label: "I want founding member pricing", state: founding, set: setFounding },
        ].map(({ id, label, state, set }) => (
          <label key={id} className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${state ? "bg-primary border-primary" : "border-white/20 bg-white/[0.03] group-hover:border-white/30"}`}
              onClick={() => set(!state)}
            >
              {state && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className="text-sm text-foreground/65">{label}</span>
          </label>
        ))}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

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
