"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, Scissors, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

function isValidUrl(value: string) {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isDirectVideoUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const knownPlatforms = [
      "youtube.com", "youtu.be", "vimeo.com", "tiktok.com",
      "twitter.com", "x.com", "t.co", "dailymotion.com",
      "instagram.com", "facebook.com", "fb.watch", "fb.com",
      "twitch.tv", "clips.twitch.tv", "reddit.com", "streamable.com", "medal.tv",
    ];
    return !knownPlatforms.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return true;
  }
}

function secondsToHms(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}

function hmsToSeconds(hms: string): number {
  const parts = hms.split(":").map(Number);
  if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  return parts[0] ?? 0;
}

export default function QuickTrimWidget() {
  const [url, setUrl] = useState("");
  const [start, setStart] = useState("00:00:00");
  const [end, setEnd] = useState("00:00:00");
  const [fetching, setFetching] = useState(false);
  // null = no duration known (e.g. Instagram/TikTok), number = max seconds
  const [maxSeconds, setMaxSeconds] = useState<number | null>(null);

  const urlValid = isValidUrl(url);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleEndBlur = () => {
    if (maxSeconds === null) return;
    const entered = hmsToSeconds(end);
    if (entered > maxSeconds) {
      const cap = secondsToHms(maxSeconds);
      toast.warning(`Video is only ${cap} long. End time reset.`);
      setEnd(cap);
    }
  };

  useEffect(() => {
    // Cancel any in-flight request or pending debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (!urlValid) {
      setEnd("00:00:00");
      setMaxSeconds(null);
      setFetching(false);
      return;
    }

    setFetching(true);

    debounceRef.current = setTimeout(async () => {
      const ac = new AbortController();
      abortRef.current = ac;

      // ── Social / platform URL → server-side oEmbed + scrape ──────────────
      if (!isDirectVideoUrl(url)) {
        try {
          const res = await fetch(
            `/api/video-meta?url=${encodeURIComponent(url.trim())}`,
            { signal: ac.signal },
          );
          const json = await res.json() as {
            data: { platform: string; duration: number | null; title: string | null } | null;
            error: string | null;
          };

          if (!res.ok || !json.data) {
            toast.error(json.error ?? "No video found at that URL.");
            setEnd("00:00:00");
            setMaxSeconds(null);
          } else if (json.data.duration !== null) {
            setMaxSeconds(json.data.duration);
            setEnd(secondsToHms(json.data.duration));
          }
          // duration null (Instagram, TikTok, etc.) — video confirmed, leave end editable
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            toast.error("Failed to fetch video metadata.");
            setEnd("00:00:00");
          }
        } finally {
          if (!ac.signal.aborted) setFetching(false);
        }
        return;
      }

      // ── Direct video file → <video> element ──────────────────────────────
      const video = document.createElement("video");
      video.preload = "metadata";

      let settled = false;

      const done = (durationSec?: number) => {
        if (settled || ac.signal.aborted) return;
        settled = true;
        clearTimeout(timeoutId);
        video.removeEventListener("loadedmetadata", onLoaded);
        video.removeEventListener("error", onError);
        video.src = "";

        if (durationSec !== undefined && isFinite(durationSec) && durationSec > 0) {
          setMaxSeconds(durationSec);
          setEnd(secondsToHms(durationSec));
        } else {
          toast.error("No video found at that URL.");
          setEnd("00:00:00");
          setMaxSeconds(null);
        }
        setFetching(false);
      };

      const onLoaded = () => done(video.duration);
      const onError  = () => done();

      // Safety net — give the browser 12s to load metadata
      const timeoutId = setTimeout(() => done(), 12_000);

      // Abort propagation into video element
      ac.signal.addEventListener("abort", () => {
        settled = true;
        clearTimeout(timeoutId);
        video.src = "";
      }, { once: true });

      video.addEventListener("loadedmetadata", onLoaded);
      video.addEventListener("error", onError);
      video.src = url.trim();
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Scissors className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground/80">Quick Trim</span>
      </div>

      {/* URL input */}
      <div className="flex items-center gap-2 p-2 rounded-xl border border-white/[0.07] bg-background/60 mb-3 focus-within:border-primary/30 transition-colors">
        <Globe className="w-4 h-4 text-muted-foreground/35 ml-2 shrink-0" />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste your media URL..."
          className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30 outline-none py-2"
        />
        {fetching && (
          <Loader2 className="w-3.5 h-3.5 text-muted-foreground/40 animate-spin mr-2 shrink-0" />
        )}
      </div>

      {/* Time inputs + button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <label className="text-[11px] font-medium text-muted-foreground/40 uppercase tracking-wider shrink-0">
            Start
          </label>
          <input
            type="text"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="00:00:00"
            className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.07] rounded-lg px-2.5 py-2 text-sm font-mono text-foreground/80 placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 transition-colors text-center"
          />
        </div>
        <span className="text-muted-foreground/30 text-sm">→</span>
        <div className="flex-1 flex items-center gap-2">
          <label className="text-[11px] font-medium text-muted-foreground/40 uppercase tracking-wider shrink-0">
            End
          </label>
          <input
            type="text"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            onBlur={handleEndBlur}
            placeholder="00:00:00"
            className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.07] rounded-lg px-2.5 py-2 text-sm font-mono text-foreground/80 placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 transition-colors text-center"
          />
        </div>
        <button
          disabled={!urlValid || fetching}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all active:scale-95 shadow-[0_0_20px_-6px_hsl(217_91%_60%/0.6)]"
        >
          Trim
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground/30">
        Supports direct video URLs · YouTube · Instagram · TikTok · Vimeo and more
      </p>
    </div>
  );
}
