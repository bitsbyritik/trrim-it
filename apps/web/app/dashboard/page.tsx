"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useSession } from "@repo/auth/client";
import PlanStatsRow from "@/components/dashboard/PlanStatsRow";
import LowBalanceBanner from "@/components/dashboard/LowBalanceBanner";
import RecentClipsTable from "@/components/dashboard/RecentClipsTable";
import QuickTrimWidget from "@/components/dashboard/QuickTrimWidget";
import AIReelsBanner from "@/components/dashboard/AIReelsBanner";
import type { Clip } from "@/lib/mock-data";

function greeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${time}, ${name.split(" ")[0]}`;
}

type ApiClip = {
  id: string;
  title: string | null;
  durationSeconds: number;
  outputUrl: string;
  createdAt: string;
};

function nameFromUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const domain = hostname.replace(/^www\./, "");
    // Known platform → "YouTube clip", "Vimeo clip", etc.
    const platformMap: Record<string, string> = {
      "youtu.be": "YouTube clip",
      "youtube.com": "YouTube clip",
      "vimeo.com": "Vimeo clip",
      "tiktok.com": "TikTok clip",
      "instagram.com": "Instagram clip",
      "twitter.com": "Twitter clip",
      "x.com": "X clip",
      "dailymotion.com": "Dailymotion clip",
    };
    for (const [host, label] of Object.entries(platformMap)) {
      if (domain === host || domain.endsWith(`.${host}`)) return label;
    }
    // Direct file — use filename without extension
    const filename = pathname.split("/").pop();
    if (filename) return decodeURIComponent(filename).replace(/\.[^.]+$/, "");
  } catch {
    // ignore
  }
  return "Unnamed link";
}

function toClip(c: ApiClip): Clip {
  return {
    id: c.id,
    name: c.title ?? "Untitled clip",
    sourceUrl: "",
    duration: c.durationSeconds,
    createdAt: c.createdAt,
    status: "ready",
    downloadUrl: c.outputUrl,
  };
}

type ApiTrimJob = {
  id: string;
  sourceUrl: string;
  status: "PENDING" | "PROCESSING";
  createdAt: string;
};

function jobToClip(j: ApiTrimJob): Clip {
  return {
    id: `job_${j.id}`,
    name: nameFromUrl(j.sourceUrl),
    sourceUrl: j.sourceUrl,
    duration: 0,
    createdAt: j.createdAt,
    status: "processing",
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [clips, setClips] = useState<Clip[]>([]);

  const loadClips = useCallback(async () => {
    try {
      const [clipsRes, jobsRes] = await Promise.all([
        fetch("/api/clips?limit=5"),
        fetch("/api/trim-jobs"),
      ]);
      const [clipsJson, jobsJson] = await Promise.all([
        clipsRes.json() as Promise<{ data?: { clips: ApiClip[] } }>,
        jobsRes.json() as Promise<{ data?: { jobs: ApiTrimJob[] } }>,
      ]);
      const processing = (jobsJson.data?.jobs ?? []).map(jobToClip);
      const ready = (clipsJson.data?.clips ?? []).map(toClip);
      setClips([...processing, ...ready].slice(0, 5));
    } catch {
      // silently ignore — stale state is better than an error screen
    }
  }, []);

  // Initial load
  useEffect(() => { void loadClips(); }, [loadClips]);

  // Poll every 3 s while any job is still processing
  const hasProcessing = clips.some((c) => c.status === "processing");
  useEffect(() => {
    if (!hasProcessing) return;
    const id = setInterval(() => void loadClips(), 5000);
    return () => clearInterval(id);
  }, [hasProcessing, loadClips]);

  const handleTrimStart = useCallback(
    (tempId: string, sourceUrl: string, title: string | null) => {
      // Optimistic row for instant feedback
      setClips((prev) => [
        {
          id: tempId,
          name: title ?? nameFromUrl(sourceUrl),
          sourceUrl,
          duration: 0,
          createdAt: new Date().toISOString(),
          status: "processing",
        },
        ...prev.slice(0, 4),
      ]);
      // Replace optimistic entry with real DB job once the POST has written it
      setTimeout(() => void loadClips(), 1500);
    },
    [loadClips],
  );

  const handleTrimComplete = useCallback(
    (
      tempId: string,
      result:
        | { success: true; clipId: string; outputUrl: string; durationSeconds: number; processedAt: string }
        | { success: false },
    ) => {
      // Optimistically update the row in case the poll hasn't fired yet
      setClips((prev) =>
        prev.map((c) => {
          if (c.id !== tempId) return c;
          if (!result.success) return { ...c, status: "failed" as const };
          return {
            ...c,
            id: result.clipId,
            duration: result.durationSeconds,
            createdAt: result.processedAt,
            status: "ready" as const,
            downloadUrl: result.outputUrl,
          };
        }),
      );
      // Sync with DB so name/duration/url are authoritative
      void loadClips();
    },
    [loadClips],
  );

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground/50 mt-0.5">
            {session ? greeting(session.user.name) : "Welcome back"}
          </p>
        </div>
        <Link
          href="/dashboard/trim"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-white font-semibold text-sm transition-all shadow-[0_0_20px_-6px_hsl(217_91%_60%/0.5)]"
        >
          <Plus style={{ width: 15, height: 15 }} />
          New Trim
        </Link>
      </div>

      <LowBalanceBanner />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlanStatsRow />
      </div>

      <QuickTrimWidget onTrimStart={handleTrimStart} onTrimComplete={handleTrimComplete} />

      <RecentClipsTable
        clips={clips}
        onDelete={(id) => setClips((prev) => prev.filter((c) => c.id !== id))}
      />

      <AIReelsBanner />
    </div>
  );
}
