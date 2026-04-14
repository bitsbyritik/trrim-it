"use client";

import { useState } from "react";
import type { DailyUsage } from "@/lib/mock-data";

type Props = {
  data: DailyUsage[];
  label?: string;
};

export default function UsageChart({ data, label = "Daily usage" }: Props) {
  const [tooltip, setTooltip] = useState<{ i: number; x: number; y: number } | null>(null);

  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);
  const hovered = tooltip?.i;

  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground/70">{label}</span>
        <span className="text-[11px] text-muted-foreground/40">minutes trimmed / day</span>
      </div>

      <div className="relative" style={{ height: 140 }}>
        {/* Y-axis guide lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <div
            key={f}
            className="absolute left-0 right-0 border-t border-white/[0.04]"
            style={{ bottom: `${f * 100}%` }}
          />
        ))}

        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-1">
          {data.map((d, i) => {
            const pct = maxMinutes > 0 ? (d.minutes / maxMinutes) * 100 : 0;
            const isHovered = hovered === i;
            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setTooltip({ i, x: rect.left + rect.width / 2, y: rect.top });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <div
                  className={`w-full rounded-sm transition-all duration-150 ${
                    d.minutes === 0
                      ? "bg-white/[0.04]"
                      : isHovered
                        ? "bg-primary"
                        : "bg-primary/50"
                  }`}
                  style={{ height: `${Math.max(pct, d.minutes === 0 ? 3 : 4)}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Tooltip */}
        {tooltip !== null && (
          <div
            className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full -mt-2"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs shadow-xl">
              <p className="font-semibold text-foreground/80">
                {data[tooltip.i]!.minutes.toFixed(1)} min
              </p>
              <p className="text-muted-foreground/40">
                {new Date(data[tooltip.i]!.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1 mt-2">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 text-center">
            {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
              <span className="text-[9px] text-muted-foreground/30">
                {new Date(d.date).getDate()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
