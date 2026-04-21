"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import ClipsGrid from "@/components/dashboard/ClipsGrid";
import type { Clip } from "@/lib/mock-data";

type DBClip = {
  id: string;
  title: string | null;
  durationSeconds: number;
  outputUrl: string;
  format: string;
  createdAt: string;
};

function mapClip(c: DBClip): Clip {
  return {
    id: c.id,
    name: c.title ?? `Clip ${c.id.slice(0, 8)}`,
    sourceUrl: c.outputUrl,
    duration: c.durationSeconds,
    createdAt: c.createdAt,
    status: "ready",
    downloadUrl: c.outputUrl,
  };
}

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clips?limit=100");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to load clips.");
        return;
      }
      const dbClips: DBClip[] = json.data?.clips ?? [];
      setClips(dbClips.map(mapClip));
      setTotal(json.data?.total ?? 0);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClips(); }, [fetchClips]);

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Clips</h1>
          <p className="text-sm text-muted-foreground/50 mt-0.5">
            {loading ? "Loading…" : `${total} clip${total !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <button
          onClick={fetchClips}
          disabled={loading}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#1f1f1f] text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.05] disabled:opacity-30 transition-all"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400/70">{error}</p>
      )}

      {!loading && !error && (
        <ClipsGrid clips={clips} pageSize={20} />
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <span className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
