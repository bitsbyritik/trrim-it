"use client";

import { useState } from "react";
import { Globe, Scissors, ArrowRight } from "lucide-react";

export default function QuickTrimWidget() {
  const [url, setUrl] = useState("");
  const [start, setStart] = useState("00:00:00");
  const [end, setEnd] = useState("00:00:00");

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
            placeholder="00:00:00"
            className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.07] rounded-lg px-2.5 py-2 text-sm font-mono text-foreground/80 placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 transition-colors text-center"
          />
        </div>
        <button
          disabled={!url.trim()}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all active:scale-95 shadow-[0_0_20px_-6px_hsl(217_91%_60%/0.6)]"
        >
          Trim
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground/30">
        Supports MP4, MOV, WebM and direct media URLs
      </p>
    </div>
  );
}
