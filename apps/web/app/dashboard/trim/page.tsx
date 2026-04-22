"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Globe, Scissors, ArrowRight, Clock, Download,
  CheckCircle2, ExternalLink, Loader2, Play, Pause,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type VideoMeta = { platform: string; duration: number | null; title: string | null };

type TrimResult = {
  clipId: string;
  outputUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  processedAt: string;
};

type YTPlayerInstance = {
  getCurrentTime(): number;
  getDuration(): number;
  seekTo(sec: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  destroy(): void;
  getPlayerState(): number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HH_MM_SS = /^\d{2}:\d{2}:\d{2}$/;

function toSec(ts: string): number {
  const [h = 0, m = 0, s = 0] = ts.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

function toHMS(seconds: number): string {
  const total = Math.floor(Math.max(0, seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function fmtDur(seconds: number): string {
  const total = Math.floor(Math.max(0, seconds));
  if (total === 0) return "0:00";
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function isValidUrl(s: string): boolean {
  try { new URL(s); return true; } catch { return false; }
}

function getYouTubeId(url: string): string | null {
  return url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;
}

// ─── YouTube IFrame API ───────────────────────────────────────────────────────

type YTWindow = Window & {
  YT?: {
    Player: new (
      el: HTMLElement | string,
      cfg: {
        videoId: string;
        playerVars?: Record<string, unknown>;
        events?: {
          onReady?: (e: { target: YTPlayerInstance }) => void;
          onStateChange?: (e: { data: number }) => void;
        };
      },
    ) => YTPlayerInstance;
    PlayerState: { PLAYING: number; PAUSED: number };
  };
  onYouTubeIframeAPIReady?: () => void;
};

let ytState: "idle" | "loading" | "ready" = "idle";
const ytCallbacks: Array<() => void> = [];

function loadYTAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (ytState === "ready") return Promise.resolve();
  return new Promise<void>((resolve) => {
    ytCallbacks.push(resolve);
    if (ytState === "loading") return;
    ytState = "loading";
    (window as YTWindow).onYouTubeIframeAPIReady = () => {
      ytState = "ready";
      ytCallbacks.forEach((cb) => cb());
      ytCallbacks.length = 0;
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({
  duration,
  currentTime,
  startSec,
  endSec,
  onSeek,
  onStartChange,
  onEndChange,
}: {
  duration: number;
  currentTime: number;
  startSec: number;
  endSec: number;
  onSeek: (t: number) => void;
  onStartChange: (t: number) => void;
  onEndChange: (t: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"start" | "end" | null>(null);

  const timeAt = useCallback(
    (clientX: number) => {
      if (!barRef.current) return 0;
      const { left, width } = barRef.current.getBoundingClientRect();
      return Math.max(0, Math.min(duration, ((clientX - left) / width) * duration));
    },
    [duration],
  );

  if (duration <= 0) return null;

  const sp = (startSec / duration) * 100;
  const ep = (endSec / duration) * 100;
  const cp = Math.min(100, (currentTime / duration) * 100);

  return (
    <div className="space-y-2">
      <div
        ref={barRef}
        className="relative h-7 flex items-center cursor-pointer select-none"
        onClick={(e) => {
          if (dragging.current) return;
          onSeek(timeAt(e.clientX));
        }}
      >
        {/* Rail */}
        <div className="absolute left-0 right-0 h-1 rounded-full bg-white/[0.06]" />

        {/* Trim region */}
        <div
          className="absolute h-1 rounded-full bg-primary/50"
          style={{ left: `${sp}%`, width: `${Math.max(0, ep - sp)}%` }}
        />

        {/* Playhead */}
        <div
          className="absolute w-px h-full bg-white/50 rounded-full pointer-events-none"
          style={{ left: `${cp}%`, transform: "translateX(-50%)" }}
        />

        {/* Start handle */}
        <div
          className="absolute z-10 w-4 h-4 rounded-full bg-primary border-2 border-background cursor-grab active:cursor-grabbing shadow-lg hover:scale-110 transition-transform"
          style={{ left: `${sp}%`, top: "50%", transform: "translate(-50%, -50%)" }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = "start";
          }}
          onPointerMove={(e) => {
            if (dragging.current !== "start") return;
            onStartChange(Math.max(0, Math.min(endSec - 1, timeAt(e.clientX))));
          }}
          onPointerUp={() => { dragging.current = null; }}
        />

        {/* End handle */}
        <div
          className="absolute z-10 w-4 h-4 rounded-full bg-primary border-2 border-background cursor-grab active:cursor-grabbing shadow-lg hover:scale-110 transition-transform"
          style={{ left: `${ep}%`, top: "50%", transform: "translate(-50%, -50%)" }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = "end";
          }}
          onPointerMove={(e) => {
            if (dragging.current !== "end") return;
            onEndChange(Math.max(startSec + 1, Math.min(duration, timeAt(e.clientX))));
          }}
          onPointerUp={() => { dragging.current = null; }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono px-0.5">
        <span className="text-muted-foreground/30">{fmtDur(0)}</span>
        <span className="text-primary/70">{fmtDur(startSec)} → {fmtDur(endSec)}</span>
        <span className="text-muted-foreground/30">{fmtDur(duration)}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrimPage() {
  const router = useRouter();

  // URL + meta
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const metaDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metaAbort = useRef<AbortController | null>(null);

  // Timestamps
  const [start, setStart] = useState("00:00:00");
  const [end, setEnd] = useState("00:00:00");

  // Player state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  // HTML5 video ref
  const videoRef = useRef<HTMLVideoElement>(null);

  // YouTube
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const ytPollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Trim
  const [trimLoading, setTrimLoading] = useState(false);
  const [result, setResult] = useState<TrimResult | null>(null);

  // Derived only from meta so ytVideoId is null while the container div is hidden
  // (loading spinner). This ensures the player effect runs only after the div
  // is mounted and ytContainerRef.current is populated.
  const ytVideoId = meta?.platform === "youtube" ? getYouTubeId(url) : null;
  const isDirectVideo = meta?.platform === "direct";
  const startSec = toSec(start);
  const endSec = toSec(end);

  // ── Meta fetch ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (metaDebounce.current) clearTimeout(metaDebounce.current);
    metaAbort.current?.abort();

    if (!url.trim() || !isValidUrl(url)) {
      setMeta(null);
      setMetaLoading(false);
      setStart("00:00:00");
      setEnd("00:00:00");
      setDuration(0);
      return;
    }

    setMetaLoading(true);
    setMeta(null);

    metaDebounce.current = setTimeout(async () => {
      const ctrl = new AbortController();
      metaAbort.current = ctrl;
      try {
        const res = await fetch(`/api/video-meta?url=${encodeURIComponent(url)}`, { signal: ctrl.signal });
        const json = await res.json() as { data?: VideoMeta; error?: string };
        if (ctrl.signal.aborted) return;
        if (res.ok && json.data) {
          setMeta(json.data);
          if (json.data.duration && json.data.duration > 0) {
            setDuration(json.data.duration);
            setEnd(toHMS(json.data.duration));
          }
        } else {
          setMeta(null);
        }
      } catch {
        // aborted or network error — ignore
      } finally {
        if (!metaAbort.current?.signal.aborted) setMetaLoading(false);
      }
    }, 600);

    return () => {
      if (metaDebounce.current) clearTimeout(metaDebounce.current);
      metaAbort.current?.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // ── YouTube player ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!ytVideoId || !ytContainerRef.current) return;

    // Tear down any existing player first
    if (ytPollerRef.current) { clearInterval(ytPollerRef.current); ytPollerRef.current = null; }
    ytPlayerRef.current?.destroy();
    ytPlayerRef.current = null;
    setCurrentTime(0);
    setPlaying(false);

    const container = ytContainerRef.current;

    loadYTAPI().then(() => {
      if (!container) return;
      const win = window as YTWindow;
      if (!win.YT?.Player) return;

      const player = new win.YT.Player(container, {
        videoId: ytVideoId,
        playerVars: { modestbranding: 1, rel: 0, controls: 1, origin: window.location.origin },
        events: {
          onReady: (e) => {
            const d = e.target.getDuration();
            if (d > 0) {
              setDuration(d);
              setEnd(toHMS(d));
            }
          },
          onStateChange: (e) => {
            const PLAYING = 1;
            const isPlaying = e.data === PLAYING;
            setPlaying(isPlaying);
            if (isPlaying) {
              ytPollerRef.current = setInterval(() => {
                setCurrentTime(ytPlayerRef.current?.getCurrentTime() ?? 0);
              }, 250);
            } else {
              if (ytPollerRef.current) { clearInterval(ytPollerRef.current); ytPollerRef.current = null; }
            }
          },
        },
      });

      ytPlayerRef.current = player;
    });

    return () => {
      if (ytPollerRef.current) { clearInterval(ytPollerRef.current); ytPollerRef.current = null; }
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytVideoId]);

  // ── Player controls ─────────────────────────────────────────────────────────

  const handleSeek = useCallback(
    (t: number) => {
      if (isDirectVideo && videoRef.current) {
        videoRef.current.currentTime = t;
        setCurrentTime(t);
      } else if (ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(t, true);
        setCurrentTime(t);
      }
    },
    [isDirectVideo],
  );

  const togglePlay = useCallback(() => {
    if (isDirectVideo && videoRef.current) {
      if (playing) videoRef.current.pause();
      else void videoRef.current.play();
    }
  }, [isDirectVideo, playing]);

  const markStart = useCallback(() => {
    setStart(toHMS(currentTime));
  }, [currentTime]);

  const markEnd = useCallback(() => {
    setEnd(toHMS(currentTime));
  }, [currentTime]);

  // ── Trim submit — same fire-and-forget pattern as QuickTrimWidget ────────────

  const handleTrim = () => {
    if (!isValidUrl(url)) { toast.error("Please enter a valid URL."); return; }
    if (!HH_MM_SS.test(start)) { toast.error("Start time must be in HH:MM:SS format."); return; }
    if (!HH_MM_SS.test(end)) { toast.error("End time must be in HH:MM:SS format."); return; }
    if (toSec(end) <= toSec(start)) { toast.error("End time must be after start time."); return; }

    setTrimLoading(true);
    setResult(null);

    void fetch("/api/trim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, start, end, title: meta?.title }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null) as { data?: TrimResult; error?: string } | null;
        if (!res.ok) {
          toast.error(json?.error ?? "Trim failed.");
        } else {
          toast.success("Clip ready!", {
            description: "Your clip has been trimmed.",
            action: { label: "View Clips", onClick: () => router.push("/dashboard/clips") },
          });
          setResult(json?.data ?? null);
        }
      })
      .catch(() => {
        toast.error("Network error. Please try again.");
      })
      .finally(() => {
        setTrimLoading(false);
      });
  };

  const showControls = !!(meta && !metaLoading && (isDirectVideo || ytVideoId));

  return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Trim</h1>
        <p className="text-sm text-muted-foreground/50 mt-0.5">
          Paste a URL, use the player to find your clip, then hit Trim.
        </p>
      </div>

      <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 space-y-5">

        {/* ── URL input ────────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground/55 uppercase tracking-wider">
            Source URL
          </label>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#1f1f1f] bg-background focus-within:border-primary/30 transition-colors">
            <Globe className="w-4 h-4 text-muted-foreground/30 shrink-0" />
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setResult(null);
                setCurrentTime(0);
                setPlaying(false);
                setDuration(0);
                setStart("00:00:00");
                setEnd("00:00:00");
              }}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/25 outline-none"
            />
            {metaLoading && (
              <Loader2 className="w-3.5 h-3.5 text-muted-foreground/30 animate-spin shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground/30">
            YouTube, TikTok, Instagram, Vimeo, Twitter/X, Twitch &amp; direct video URLs.
          </p>
        </div>

        {/* ── Video player ─────────────────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden border border-[#1f1f1f] bg-black">
          {metaLoading ? (
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-6 h-6 text-muted-foreground/25 mx-auto mb-2 animate-spin" />
                <p className="text-xs text-muted-foreground/30">Fetching video…</p>
              </div>
            </div>
          ) : ytVideoId ? (
            // YouTube — YT IFrame API renders inside this div
            <div key={ytVideoId} ref={ytContainerRef} className="aspect-video w-full" />
          ) : isDirectVideo ? (
            // Direct URL — HTML5 video, custom controls below
            <video
              ref={videoRef}
              src={url}
              className="w-full aspect-video bg-black"
              controls
              playsInline
              onLoadedMetadata={(e) => {
                const d = e.currentTarget.duration;
                if (isFinite(d) && d > 0) {
                  setDuration(d);
                  setEnd(toHMS(d));
                }
              }}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            />
          ) : meta ? (
            // Social platform without embeddable player
            <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-white/[0.02]">
              <Scissors className="w-8 h-8 text-primary/30" />
              {meta.title && (
                <p className="text-sm font-medium text-foreground/70 text-center max-w-xs px-4 line-clamp-2">
                  {meta.title}
                </p>
              )}
              <p className="text-xs text-muted-foreground/40">
                {meta.platform}{meta.duration ? ` · ${fmtDur(meta.duration)}` : ""}
              </p>
              <p className="text-[11px] text-muted-foreground/25 text-center px-8">
                Set your timestamps below — the trim will process server-side.
              </p>
            </div>
          ) : (
            // Empty state
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <Globe className="w-8 h-8 text-muted-foreground/15 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground/25">Paste a URL above to load the video</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Player controls ───────────────────────────────────────────────── */}
        {showControls && (
          <div className="flex items-center gap-3">
            {/* Play/Pause only for direct video; YouTube has built-in controls */}
            {isDirectVideo && (
              <button
                onClick={togglePlay}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.09] transition-colors text-foreground/70"
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}

            <span className="text-xs font-mono text-muted-foreground/50 tabular-nums shrink-0">
              {fmtDur(currentTime)}{duration > 0 ? ` / ${fmtDur(duration)}` : ""}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={markStart}
                title="Set start to current playback position"
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#2a2a2a] text-muted-foreground/60 hover:border-primary/40 hover:text-primary transition-colors whitespace-nowrap"
              >
                ← Mark Start
              </button>
              <button
                onClick={markEnd}
                title="Set end to current playback position"
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#2a2a2a] text-muted-foreground/60 hover:border-primary/40 hover:text-primary transition-colors whitespace-nowrap"
              >
                Mark End →
              </button>
            </div>
          </div>
        )}

        {/* ── Trim timeline ────────────────────────────────────────────────── */}
        {duration > 0 && (
          <div className="px-1">
            <Timeline
              duration={duration}
              currentTime={currentTime}
              startSec={startSec}
              endSec={endSec}
              onSeek={handleSeek}
              onStartChange={(t) => setStart(toHMS(t))}
              onEndChange={(t) => setEnd(toHMS(t))}
            />
          </div>
        )}

        {/* ── Timestamp inputs ──────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground/55 uppercase tracking-wider flex items-center gap-1.5">
            <Clock style={{ width: 12, height: 12 }} />
            Timestamps
            {duration > 0 && (
              <span className="ml-auto text-[10px] text-muted-foreground/35 normal-case tracking-normal">
                Clip: {fmtDur(Math.max(0, endSec - startSec))} · Total: {fmtDur(duration)}
              </span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { label: "Start", value: start, onChange: (v: string) => setStart(v) },
              { label: "End",   value: end,   onChange: (v: string) => setEnd(v) },
            ] as const).map(({ label, value, onChange }) => (
              <div key={label} className="space-y-1">
                <span className="text-[10px] text-muted-foreground/40">{label}</span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="00:00:00"
                  className="w-full bg-background border border-[#1f1f1f] rounded-xl px-4 py-3 text-sm font-mono text-foreground/80 placeholder:text-muted-foreground/25 outline-none focus:border-primary/30 transition-colors text-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleTrim}
            disabled={!isValidUrl(url) || trimLoading || metaLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all active:scale-[0.99] shadow-[0_0_24px_-6px_hsl(217_91%_60%/0.5)]"
          >
            {trimLoading ? (
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

        {/* ── Result ────────────────────────────────────────────────────────── */}
        {result && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/[0.04] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-sm font-semibold text-green-300">Clip ready!</span>
              <span className="ml-auto text-xs text-muted-foreground/40 tabular-nums">
                {fmtDur(result.durationSeconds)}
              </span>
            </div>

            {/* Inline preview */}
            <video
              src={result.outputUrl}
              controls
              className="w-full rounded-lg border border-[#1f1f1f] max-h-48"
            />

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
