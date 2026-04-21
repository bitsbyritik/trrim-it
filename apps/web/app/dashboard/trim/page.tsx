"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Globe, Scissors, ArrowRight, Clock, Download,
  CheckCircle2, ExternalLink, Loader2,
} from "lucide-react";

const HH_MM_SS = /^\d{2}:\d{2}:\d{2}$/;

function toSeconds(ts: string): number {
  const [h = 0, m = 0, s = 0] = ts.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

function secondsToHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function isValidUrl(s: string): boolean {
  try { new URL(s); return true; } catch { return false; }
}

type VideoMeta = { platform: string; duration: number | null; title: string | null };

type TrimResult = {
  clipId: string;
  jobId: string;
  outputUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  processedAt: string;
};

export default function TrimPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [start, setStart] = useState("00:00:00");
  const [end, setEnd] = useState("00:00:00");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrimResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const metaDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metaAbort = useRef<AbortController | null>(null);

  // Debounced meta fetch whenever URL changes
  useEffect(() => {
    if (metaDebounce.current) clearTimeout(metaDebounce.current);
    metaAbort.current?.abort();

    if (!url.trim() || !isValidUrl(url)) {
      setMeta(null);
      setMetaLoading(false);
      setEnd("00:00:00");
      return;
    }

    setMetaLoading(true);
    setMeta(null);
    setEnd("00:00:00"); // reset while fetching so user sees it update

    metaDebounce.current = setTimeout(async () => {
      const controller = new AbortController();
      metaAbort.current = controller;

      try {
        const res = await fetch(
          `/api/video-meta?url=${encodeURIComponent(url)}`,
          { signal: controller.signal },
        );
        const json = await res.json();

        if (controller.signal.aborted) return;

        if (res.ok && json.data) {
          const m = json.data as VideoMeta;
          setMeta(m);
          if (m.duration && m.duration > 0) {
            setEnd(secondsToHMS(m.duration));
          }
        } else {
          setMeta(null);
        }
      } catch {
        // aborted or network error — ignore
      } finally {
        if (!metaAbort.current?.signal.aborted) {
          setMetaLoading(false);
        }
      }
    }, 600);

    return () => {
      if (metaDebounce.current) clearTimeout(metaDebounce.current);
      metaAbort.current?.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const validate = (): string | null => {
    if (!url.trim()) return "Please enter a source URL.";
    if (!HH_MM_SS.test(start)) return "Start time must be in HH:MM:SS format.";
    if (!HH_MM_SS.test(end)) return "End time must be in HH:MM:SS format.";
    if (toSeconds(end) <= toSeconds(start)) return "End time must be after start time.";
    return null;
  };

  const handleTrim = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/trim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, start, end }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Trim failed.");
      } else {
        setResult(json.data as TrimResult);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Trim</h1>
        <p className="text-sm text-muted-foreground/50 mt-0.5">
          Paste a URL, set your timestamps, and get your clip.
        </p>
      </div>

      <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 space-y-5">
        {/* URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground/55 uppercase tracking-wider">
            Source URL
          </label>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#1f1f1f] bg-background focus-within:border-primary/30 transition-colors">
            <Globe className="w-4 h-4 text-muted-foreground/30 shrink-0" />
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(null); setResult(null); }}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/25 outline-none"
            />
            {metaLoading && (
              <Loader2 className="w-3.5 h-3.5 text-muted-foreground/30 animate-spin shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground/30">
            Supports YouTube, TikTok, Instagram, Vimeo, Twitter/X, Twitch &amp; direct media URLs.
          </p>
        </div>

        {/* Video preview / meta */}
        <div className="w-full aspect-video rounded-xl bg-white/[0.02] border border-[#1f1f1f] flex flex-col items-center justify-center gap-3">
          {metaLoading ? (
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-muted-foreground/25 mx-auto mb-2 animate-spin" />
              <p className="text-xs text-muted-foreground/30">Fetching video info…</p>
            </div>
          ) : meta ? (
            <div className="text-center px-6">
              <Scissors className="w-7 h-7 text-primary/40 mx-auto mb-2" />
              {meta.title && (
                <p className="text-sm font-medium text-foreground/70 truncate max-w-xs">{meta.title}</p>
              )}
              <p className="text-xs text-muted-foreground/35 mt-1">
                {meta.platform}
                {meta.duration ? ` · ${formatDuration(meta.duration)}` : ""}
              </p>
            </div>
          ) : url ? (
            <div className="text-center">
              <Scissors className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground/30">Video preview loads after fetching</p>
            </div>
          ) : (
            <div className="text-center">
              <Globe className="w-8 h-8 text-muted-foreground/15 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground/25">Paste a URL above to load the video</p>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground/55 uppercase tracking-wider flex items-center gap-1.5">
            <Clock style={{ width: 12, height: 12 }} />
            Timestamps (HH:MM:SS)
            {meta?.duration && (
              <span className="ml-auto text-[10px] text-muted-foreground/35 normal-case tracking-normal">
                Total: {formatDuration(meta.duration)}
              </span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Start", value: start, set: setStart },
              { label: "End",   value: end,   set: setEnd },
            ].map(({ label, value, set }) => (
              <div key={label} className="space-y-1">
                <span className="text-[10px] text-muted-foreground/40">{label}</span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => { set(e.target.value); setError(null); }}
                  placeholder="00:00:00"
                  className="w-full bg-background border border-[#1f1f1f] rounded-xl px-4 py-3 text-sm font-mono text-foreground/80 placeholder:text-muted-foreground/25 outline-none focus:border-primary/30 transition-colors text-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleTrim}
            disabled={!url.trim() || loading || metaLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all active:scale-[0.99] shadow-[0_0_24px_-6px_hsl(217_91%_60%/0.5)]"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Scissors className="w-4 h-4" />
                Trim Now
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <a
            href={result?.outputUrl ?? "#"}
            download
            aria-disabled={!result?.outputUrl}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[#1f1f1f] text-sm font-medium transition-colors ${
              result?.outputUrl
                ? "text-foreground/70 hover:border-primary/30 hover:text-foreground cursor-pointer"
                : "text-muted-foreground/35 pointer-events-none"
            }`}
          >
            <Download className="w-4 h-4" />
            Export
          </a>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400/80 pt-1">{error}</p>
        )}

        {/* Success */}
        {result && (
          <div className="mt-2 rounded-xl border border-green-500/20 bg-green-500/[0.04] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-sm font-semibold text-green-300">Clip ready!</span>
              <span className="ml-auto text-xs text-muted-foreground/40 tabular-nums">
                {formatDuration(result.durationSeconds)}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={result.outputUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground/70 border border-[#2a2a2a] hover:border-primary/30 hover:text-foreground transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                Open clip
              </a>
              <a
                href={result.outputUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground/70 border border-[#2a2a2a] hover:border-primary/30 hover:text-foreground transition-all"
              >
                <Download className="w-3 h-3" />
                Download
              </a>
              <button
                onClick={() => router.push("/dashboard/clips")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary/70 border border-primary/20 hover:border-primary/40 hover:text-primary transition-all ml-auto"
              >
                View in My Clips
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
