import Link from "next/link";
import { Scissors, Download, Copy, Trash2, RotateCcw } from "lucide-react";
import { ClipStatusBadge } from "@/components/ui/StatusBadge";
import { formatDuration, formatDate, type Clip } from "@/lib/mock-data";

type Props = {
  clips: Clip[];
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-[#1f1f1f] flex items-center justify-center">
        <Scissors className="w-6 h-6 text-muted-foreground/20" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground/40">No clips yet</p>
        <p className="text-xs text-muted-foreground/30 mt-1 max-w-[200px]">
          Paste a URL in the Quick Trim widget to create your first clip.
        </p>
      </div>
    </div>
  );
}

function ThumbnailPlaceholder({ name }: { name: string }) {
  return (
    <div className="w-10 h-7 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
      <span className="text-[9px] font-bold text-muted-foreground/30 uppercase">
        {name.slice(0, 2)}
      </span>
    </div>
  );
}

export default function RecentClipsTable({ clips }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground/60 uppercase tracking-wider">
          Recent Clips
        </h2>
        {clips.length > 0 && (
          <Link
            href="/dashboard/clips"
            className="text-xs text-primary/70 hover:text-primary transition-colors"
          >
            View all →
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] overflow-hidden">
        {clips.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[auto_1fr_80px_120px_100px_80px] gap-3 items-center px-4 py-2.5 border-b border-[#1f1f1f]">
              {["", "Name", "Duration", "Created", "Status", "Actions"].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-muted-foreground/30 uppercase tracking-wider">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="group grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_80px_120px_100px_80px] gap-3 items-center px-4 py-3.5 border-b border-[#1f1f1f] last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <ThumbnailPlaceholder name={clip.name} />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground/80 truncate">{clip.name}</p>
                  <p className="text-[11px] text-muted-foreground/35 truncate sm:hidden">
                    {formatDuration(clip.duration)} · {formatDate(clip.createdAt)}
                  </p>
                </div>

                <span className="hidden sm:block text-sm text-muted-foreground/50 tabular-nums">
                  {formatDuration(clip.duration)}
                </span>

                <span className="hidden sm:block text-xs text-muted-foreground/40">
                  {formatDate(clip.createdAt)}
                </span>

                <div className="hidden sm:flex">
                  <ClipStatusBadge status={clip.status} />
                </div>

                {/* Actions */}
                <div className="hidden sm:flex items-center gap-1 justify-end">
                  {clip.status === "ready" && (
                    <a
                      href={clip.downloadUrl ?? "#"}
                      title="Download"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.06] transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {clip.status === "ready" && (
                    <button
                      title="Copy link"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.06] transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {clip.status === "failed" && (
                    <button
                      title="Retry"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/[0.08] transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    title="Delete"
                    className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
