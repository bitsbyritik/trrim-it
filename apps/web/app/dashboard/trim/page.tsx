"use client";

import { useState } from "react";
import { Globe, Scissors, ArrowRight, Clock, Download } from "lucide-react";

export default function TrimPage() {
  const [url, setUrl] = useState("");
  const [start, setStart] = useState("00:00:00");
  const [end, setEnd] = useState("00:00:00");
  const [loading, setLoading] = useState(false);

  const handleTrim = () => {
    if (!url.trim()) return;
    setLoading(true);
    // TODO: call trimming API
    setTimeout(() => setLoading(false), 2000);
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
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/25 outline-none"
            />
          </div>
          <p className="text-[11px] text-muted-foreground/30">
            Supports YouTube, TikTok, Instagram, Vimeo, Twitter/X, Twitch &amp; direct media URLs.
          </p>
        </div>

        {/* Video preview placeholder */}
        <div className="w-full aspect-video rounded-xl bg-white/[0.02] border border-[#1f1f1f] flex flex-col items-center justify-center gap-3">
          {url ? (
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
                  onChange={(e) => set(e.target.value)}
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
            disabled={!url.trim() || loading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all active:scale-[0.99] shadow-[0_0_24px_-6px_hsl(217_91%_60%/0.5)]"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Scissors className="w-4 h-4" />
                Trim Now
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[#1f1f1f] text-muted-foreground/35 text-sm font-medium disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
