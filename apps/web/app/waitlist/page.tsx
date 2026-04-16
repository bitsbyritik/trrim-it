"use client";

import { Sparkles, ArrowLeft, CheckCircle2, Zap, LayoutGrid, Captions } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useWaitlist } from "@/hooks/useWaitlist";

const FEATURES = [
  { icon: Zap, title: "Viral Moment Detection", body: "AI finds the clips worth sharing." },
  { icon: LayoutGrid, title: "Multi-Platform Export", body: "TikTok, Reels, Shorts — auto-resized." },
  { icon: Captions, title: "Auto Captions", body: "Styled subtitles, burned in." },
];

export default function WaitlistPage() {
  const { email, setEmail, notifyMe, setNotifyMe, foundingMember, setFoundingMember, loading, joined, submit } =
    useWaitlist();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#3b82f6", "#8b5cf6", "#ffffff"],
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back link */}
      <div className="container pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground/50 hover:text-foreground/80 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to trrim.it
        </Link>
      </div>

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none select-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-accent/10 blur-[140px]" />
        <div className="absolute bottom-[-5%] right-[10%] w-[400px] h-[400px] rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <main className="flex-1 flex items-center justify-center py-16 px-4 relative z-10">
        <div className="w-full max-w-5xl mx-auto">
          {/* Headline section */}
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-px w-8 bg-accent/40" />
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="text-[11px] font-bold tracking-[0.2em] text-accent/80 uppercase">AI Reels</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase">
                Coming Soon
              </span>
              <div className="h-px w-8 bg-accent/40" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              <span className="text-foreground/85">Your best moments,</span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, hsl(263 70% 72%), hsl(217 91% 70%))" }}
              >
                found automatically.
              </span>
            </h1>
            <p className="text-base text-muted-foreground/60 max-w-lg mx-auto leading-relaxed">
              Paste a long video, let AI surface the viral moments — reformatted for every platform, captions included.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
            {/* Feature list */}
            <div className="space-y-4">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-accent/20 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground/85 mb-0.5">{title}</p>
                    <p className="text-xs text-muted-foreground/55 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex items-center gap-3 text-xs text-muted-foreground/35">
                <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07]">Beta · Q3 2026</span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07]">Founding pricing locked in</span>
              </div>
            </div>

            {/* Form card */}
            <div className="relative rounded-2xl border border-accent/25 bg-[#0f0f0f] overflow-hidden shadow-[0_0_80px_-20px_hsl(263_70%_64%/0.3)]">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full bg-accent/10 blur-[50px] pointer-events-none" />

              <div className="relative p-8">
                {joined ? (
                  <div className="flex flex-col items-center text-center py-6 gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-green-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground/90 mb-1">You&apos;re on the list!</p>
                      <p className="text-sm text-muted-foreground/55 max-w-xs">
                        We&apos;ll notify you before public launch. Founding member pricing is locked in for you.
                      </p>
                    </div>
                    <Link
                      href="/"
                      className="mt-2 px-6 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-foreground/70 hover:border-white/20 hover:text-foreground/90 transition-all"
                    >
                      Back to trrim.it
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <h2 className="text-base font-bold text-foreground/90">Reserve your spot</h2>
                      </div>
                      <p className="text-xs text-muted-foreground/50">
                        Be first when AI Reels ships. No spam, unsubscribe anytime.
                      </p>
                    </div>

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
                          autoFocus
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
                        className="w-full py-3.5 rounded-xl font-semibold text-sm text-white disabled:opacity-60 transition-all active:scale-[0.99]"
                        style={{
                          background: "linear-gradient(135deg, hsl(263 70% 55%), hsl(217 91% 55%))",
                          boxShadow: "0 0 30px -8px hsl(263 70% 64% / 0.4)",
                        }}
                      >
                        {loading ? "Reserving your spot..." : "Reserve My Spot"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
