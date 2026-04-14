"use client";

import { useEffect, useState } from "react";

type Props = {
  used: number;
  total: number | null;
  unit: string;
};

export default function UsageMeter({ used, total, unit }: Props) {
  const [width, setWidth] = useState(0);
  const pct = total != null && total > 0 ? Math.min((used / total) * 100, 100) : 0;

  if (total == null) return null;

  useEffect(() => {
    // Defer by one tick so the CSS transition fires visibly on mount
    const id = setTimeout(() => setWidth(pct), 50);
    return () => clearTimeout(id);
  }, [pct]);

  const barColor =
    pct < 70 ? "bg-green-500" : pct < 90 ? "bg-amber-400" : "bg-red-500";

  return (
    <div className="mt-4 space-y-1.5">
      <div className="flex justify-between text-[11px] text-muted-foreground/50 tabular-nums">
        <span>
          {used} / {total ?? "∞"} {unit} used
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-[600ms] ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
