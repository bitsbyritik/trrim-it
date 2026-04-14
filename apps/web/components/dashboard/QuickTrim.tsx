"use client";

import { useState } from "react";
import { Globe, ArrowRight, Scissors } from "lucide-react";

export default function QuickTrim() {
  const [url, setUrl] = useState("");

  return (
    <div className="mb-10">
      <h2 className="text-sm font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
        Quick Trim
      </h2>
      <div className="relative flex items-center gap-2 p-2 rounded-2xl border border-white/[0.09] bg-white/[0.02] backdrop-blur-sm transition-all duration-300 focus-within:border-primary/30 focus-within:bg-white/[0.03]">
        <div className="flex items-center flex-1 gap-3 pl-3 min-w-0">
          <Globe className="w-4 h-4 text-muted-foreground/40 shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste any video URL to start trimming..."
            className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/35 outline-none py-3"
          />
        </div>
        <button
          disabled={!url.trim()}
          className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-150 shadow-[0_0_24px_-6px_hsl(217_91%_60%/0.6)]"
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Trim It</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
