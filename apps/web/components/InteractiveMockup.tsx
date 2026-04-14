"use client";

import { useState } from "react";
import { Play, Download, Scissors, Volume2 } from "lucide-react";

const TOTAL_SECONDS = 330;

const toTimecode = (pct: number): string => {
  const s = Math.round((pct / 100) * TOTAL_SECONDS);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export default function InteractiveMockup() {
  const [startPct, setStartPct] = useState(23);
  const [endPct, setEndPct] = useState(48);

  const handleStart = (v: number) => setStartPct(Math.min(v, endPct - 5));
  const handleEnd = (v: number) => setEndPct(Math.max(v, startPct + 5));

  const clipSeconds = Math.round(((endPct - startPct) / 100) * TOTAL_SECONDS);

  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Precision trimming,{" "}
            <span className="text-gradient-primary">zero friction</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-base">
            After fetching your video, drag the handles to define your exact clip window.
            That&apos;s your download.
          </p>
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_0_100px_-30px_hsl(217_91%_60%/0.2)]">
          {/* ── Video Player ── */}
          <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0c0c1a] to-black" />
            <div className="absolute top-[15%] left-[20%] w-48 h-36 bg-primary/10 rounded-full blur-[70px]" />
            <div className="absolute bottom-[20%] right-[25%] w-40 h-28 bg-accent/8 rounded-full blur-[60px]" />
            {[...Array(10)].map((_, i) => (
              <div key={i} className="absolute w-full h-px bg-white/[0.025]" style={{ top: `${8 + i * 8.5}%` }} />
            ))}

            <button className="relative z-10 w-16 h-16 rounded-full border border-white/20 bg-white/[0.08] backdrop-blur-sm flex items-center justify-center hover:bg-white/15 transition-colors group">
              <Play className="w-6 h-6 text-white fill-white ml-0.5 group-hover:scale-110 transition-transform" />
            </button>

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Live Preview</span>
            </div>
            <div className="absolute bottom-10 right-4 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-white text-xs font-mono">
              05:30
            </div>
            <div className="absolute bottom-10 left-4">
              <Volume2 className="w-4 h-4 text-white/40" />
            </div>

            {/* Mini progress strip */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.08]">
              <div
                className="absolute h-full bg-gradient-to-r from-primary to-accent opacity-80"
                style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
              />
            </div>
          </div>

          {/* ── Timeline Controls ── */}
          <div className="p-6 bg-[#0d0d0d] space-y-5 border-t border-white/[0.06]">
            {/* Timecodes row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">Start</span>
                <span className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 font-mono text-primary text-sm font-bold tabular-nums">
                  {toTimecode(startPct)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                <Scissors className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">{clipSeconds}s</span>
                <span>selected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">End</span>
                <span className="px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 font-mono text-accent text-sm font-bold tabular-nums">
                  {toTimecode(endPct)}
                </span>
              </div>
            </div>

            {/* Dual-range slider track */}
            <div className="relative h-8 flex items-center select-none">
              {/* Waveform bars */}
              <div className="absolute inset-0 flex items-center gap-px overflow-hidden pointer-events-none">
                {[...Array(80)].map((_, i) => {
                  const inRange = (i / 80) * 100 >= startPct && (i / 80) * 100 <= endPct;
                  const h = 20 + Math.sin(i * 0.7) * 12 + Math.cos(i * 1.3) * 8;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-sm transition-colors duration-150"
                      style={{
                        height: `${Math.max(4, h)}%`,
                        background: inRange
                          ? `hsl(${217 + (i % 20)}deg 80% 60% / 0.6)`
                          : "rgba(255,255,255,0.07)",
                      }}
                    />
                  );
                })}
              </div>

              {/* Track */}
              <div className="relative w-full h-1.5 rounded-full">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                />
                {/* Visual thumbs */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary border-2 border-white shadow-[0_0_14px_hsl(217_91%_60%/0.9)] z-20 pointer-events-none"
                  style={{ left: `calc(${startPct}% - 10px)` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-accent border-2 border-white shadow-[0_0_14px_hsl(263_70%_64%/0.9)] z-20 pointer-events-none"
                  style={{ left: `calc(${endPct}% - 10px)` }}
                />
                {/* Invisible range inputs */}
                <input
                  type="range" min={0} max={100} value={startPct}
                  onChange={(e) => handleStart(Number(e.target.value))}
                  className="dual-range cursor-ew-resize"
                  style={{ zIndex: startPct > 90 ? 5 : 3 }}
                />
                <input
                  type="range" min={0} max={100} value={endPct}
                  onChange={(e) => handleEnd(Number(e.target.value))}
                  className="dual-range cursor-ew-resize"
                  style={{ zIndex: 4 }}
                />
              </div>
            </div>

            {/* Export button */}
            <button className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 active:scale-[0.99] text-white font-semibold text-base transition-all duration-150 shadow-[0_0_40px_-8px_hsl(217_91%_60%/0.6)]">
              <Download className="w-5 h-5" />
              Export &amp; Download Clip
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
