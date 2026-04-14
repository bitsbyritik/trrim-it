import { Sparkles, Zap, LayoutGrid, Captions } from "lucide-react";
import { getSession } from "@/lib/dummy-auth";
import FeaturePreviewCard from "@/components/dashboard/FeaturePreviewCard";
import WaitlistForm from "@/components/dashboard/WaitlistForm";

const ROADMAP = [
  { label: "Beta testing", date: "Q3 2026", done: false, current: false },
  { label: "Creator plan early access", date: "Q4 2026", done: false, current: false },
  { label: "General availability", date: "2027", done: false, current: false },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Viral Moment Detection",
    description: "AI scans your video and identifies the top moments most likely to drive engagement.",
    status: "In Development" as const,
  },
  {
    icon: LayoutGrid,
    title: "Multi-Platform Export",
    description: "Exports automatically resized for TikTok (9:16), Instagram Reels, and YouTube Shorts.",
    status: "In Development" as const,
  },
  {
    icon: Captions,
    title: "Auto Captions",
    description: "Transcription-based captions styled and synced — ready to post.",
    status: "Planned" as const,
  },
];

export default async function AIReelsPage() {
  const session = await getSession();

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto space-y-12">

      {/* Hero */}
      <div className="text-center py-8">
        <div className="relative inline-flex mb-6">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-accent" style={{ filter: "drop-shadow(0 0 12px hsl(263 70% 64% / 0.6))" }} />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-accent/10 blur-xl animate-pulse" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          AI Reels is almost here
        </h1>
        <p className="text-base text-muted-foreground/60 max-w-lg mx-auto leading-relaxed mb-8">
          Paste any long video and let AI find the viral moments — reformatted for every platform, captions included.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, hsl(263 70% 55%), hsl(217 91% 55%))",
              boxShadow: "0 0 30px -8px hsl(263 70% 64% / 0.5)",
            }}
          >
            <Sparkles className="w-4 h-4" />
            Join Waitlist
          </a>
          <a
            href="#preview"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-muted-foreground/60 hover:text-foreground/80 border border-white/[0.08] hover:border-white/[0.15] transition-all"
          >
            Learn how it works
          </a>
        </div>
      </div>

      {/* Feature preview cards */}
      <div id="preview" className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground/50 uppercase tracking-wider">
          What&apos;s coming
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <FeaturePreviewCard key={f.title} {...f} />
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground/50 uppercase tracking-wider">
          Roadmap
        </h2>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-0">
          {ROADMAP.map((milestone, i) => (
            <div key={milestone.label} className="flex sm:flex-1 items-start sm:items-center gap-3 sm:gap-0 sm:flex-col">
              <div className="flex sm:flex-row items-center sm:w-full">
                <div className={`w-3 h-3 rounded-full border-2 shrink-0 z-10 ${milestone.current ? "border-primary bg-primary" : "border-[#2a2a2a] bg-background"}`} />
                {i < ROADMAP.length - 1 && (
                  <div className="hidden sm:block flex-1 h-px bg-[#1f1f1f]" />
                )}
                {i < ROADMAP.length - 1 && (
                  <div className="sm:hidden w-px h-8 bg-[#1f1f1f] ml-1.5" />
                )}
              </div>
              <div className="sm:text-center sm:pt-3 pb-4 sm:pb-0">
                <p className="text-sm font-medium text-foreground/70">{milestone.label}</p>
                <p className="text-xs text-muted-foreground/40 mt-0.5">{milestone.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Waitlist form */}
      <div id="waitlist" className="rounded-2xl border border-accent/20 bg-[#111111] p-6 sm:p-8 max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-foreground/90">Reserve your spot</h2>
          <p className="text-sm text-muted-foreground/50 mt-1">
            We&apos;ll notify you before public launch.
          </p>
        </div>
        <WaitlistForm defaultEmail={session?.email} userId={session?.id} />
      </div>
    </div>
  );
}
