"use client";

import { useEffect, useState } from "react";
import { Zap, Clock, X } from "lucide-react";
import Link from "next/link";
import { usePlan } from "@/hooks/usePlan";

const DISMISS_KEY = "trrim_banner_dismissed";

function getDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const { date } = JSON.parse(raw) as { date: string };
    return date === new Date().toISOString().split("T")[0];
  } catch {
    return false;
  }
}

function setDismissed() {
  localStorage.setItem(
    DISMISS_KEY,
    JSON.stringify({ date: new Date().toISOString().split("T")[0] })
  );
}

export default function LowBalanceBanner() {
  const { plan, credits, minutesUsed, minutesTotal, isLowCredits, isNearLimit, openBuyCredits } = usePlan();
  const [dismissed, setDismissedState] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    setDismissedState(getDismissed());
  }, []);

  const showPayg = plan === "payg" && isLowCredits;
  const showFree = plan === "free" && isNearLimit;

  if (dismissed || (!showPayg && !showFree)) return null;

  const handleDismiss = () => {
    setDismissed();
    setDismissedState(true);
  };

  if (showPayg) {
    return (
      <div className="flex items-start justify-between gap-4 px-4 py-3.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.06]">
        <div className="flex items-start gap-3">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-200/80">
              You have{" "}
              <span className="font-bold">{(credits ?? 0).toFixed(1)} min</span> of
              credits remaining — enough for ~{Math.floor((credits ?? 0) / 1.5)} short clips.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={openBuyCredits}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 px-3 py-1.5 rounded-lg transition-all"
          >
            Top Up Now
          </button>
          <button onClick={handleDismiss} className="text-amber-400/50 hover:text-amber-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const used = minutesUsed;
  const total = minutesTotal ?? 10;

  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.06]">
      <div className="flex items-start gap-3">
        <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-amber-200/80">
          You&apos;ve used{" "}
          <span className="font-bold">{used.toFixed(1)}</span> of your{" "}
          <span className="font-bold">{total} free minutes</span> this month.
          Upgrade to keep trimming.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/dashboard/settings#billing"
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 px-3 py-1.5 rounded-lg transition-all"
        >
          See Plans
        </Link>
        <button onClick={handleDismiss} className="text-amber-400/50 hover:text-amber-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
