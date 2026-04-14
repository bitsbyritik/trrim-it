import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({ className, style }: Props) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/[0.06]", className)}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-[#1f1f1f]">
      <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
      <Skeleton className="h-3 flex-1 max-w-[200px]" />
      <Skeleton className="h-3 w-14 hidden sm:block" />
      <Skeleton className="h-3 w-20 hidden md:block" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-7 w-7 rounded-md ml-auto" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3 border-b border-[#1f1f1f]">
        {[120, 80, 100, 70].map((w, i) => (
          <Skeleton key={i} className={`h-3`} style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="flex items-end gap-1.5 h-32">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: `${20 + Math.random() * 80}%` }}
          />
        ))}
      </div>
    </div>
  );
}
