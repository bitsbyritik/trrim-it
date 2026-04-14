"use client";

import { useState } from "react";
import {
  Search, LayoutList, Grid2X2, Download, Trash2, RotateCcw,
  Copy, ChevronLeft, ChevronRight, SlidersHorizontal,
} from "lucide-react";
import { ClipStatusBadge } from "@/components/ui/StatusBadge";
import { formatDuration, formatDate, type Clip, type ClipStatus } from "@/lib/mock-data";

type SortKey = "newest" | "oldest" | "longest" | "shortest";
type ViewMode = "list" | "grid";

type Props = { clips: Clip[]; pageSize?: number };

function ThumbnailBox({ name, large }: { name: string; large?: boolean }) {
  return (
    <div
      className={`rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 ${large ? "w-full aspect-video" : "w-10 h-7"}`}
    >
      <span className={`font-bold text-muted-foreground/25 uppercase ${large ? "text-sm" : "text-[9px]"}`}>
        {name.slice(0, 2)}
      </span>
    </div>
  );
}

export default function ClipsGrid({ clips, pageSize = 20 }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClipStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<ViewMode>("list");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // Filter + sort
  const filtered = clips
    .filter((c) => {
      const matchQuery = c.name.toLowerCase().includes(query.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchQuery && matchStatus;
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "longest") return b.duration - a.duration;
      return a.duration - b.duration;
    });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearFilters = () => { setQuery(""); setStatusFilter("all"); setPage(1); };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-[#111111] border border-[#1f1f1f] rounded-xl px-3 py-2 focus-within:border-primary/30 transition-colors">
          <Search className="w-3.5 h-3.5 text-muted-foreground/35 shrink-0" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search clips..."
            className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30 outline-none"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as ClipStatus | "all"); setPage(1); }}
          className="bg-[#111111] border border-[#1f1f1f] rounded-xl px-3 py-2 text-sm text-muted-foreground/60 outline-none focus:border-primary/30 transition-colors cursor-pointer"
        >
          {["all", "ready", "processing", "failed"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="bg-[#111111] border border-[#1f1f1f] rounded-xl px-3 py-2 text-sm text-muted-foreground/60 outline-none focus:border-primary/30 transition-colors cursor-pointer"
        >
          {[["newest","Newest"],["oldest","Oldest"],["longest","Longest"],["shortest","Shortest"]].map(([v,l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        {/* View toggle */}
        <div className="flex items-center gap-0.5 bg-[#111111] border border-[#1f1f1f] rounded-xl p-1">
          {([["list", LayoutList], ["grid", Grid2X2]] as [ViewMode, React.ElementType][]).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${view === mode ? "bg-white/[0.08] text-foreground" : "text-muted-foreground/40 hover:text-foreground/60"}`}
            >
              <Icon style={{ width: 14, height: 14 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <span className="text-sm font-medium text-primary">{selected.size} clip{selected.size > 1 ? "s" : ""} selected</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground/70 hover:bg-white/[0.06] transition-all">
              <Download style={{ width: 12, height: 12 }} /> Download
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/80 hover:bg-red-500/[0.08] transition-all">
              <Trash2 style={{ width: 12, height: 12 }} /> Delete
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground/50 hover:bg-white/[0.05] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl border border-[#1f1f1f] bg-[#111111]">
          <SlidersHorizontal className="w-8 h-8 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground/35">No clips match your filters</p>
          <button
            onClick={clearFilters}
            className="text-xs text-primary/70 hover:text-primary transition-colors"
          >
            Reset filters
          </button>
        </div>
      ) : view === "list" ? (
        <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] overflow-hidden">
          <div className="hidden sm:grid grid-cols-[24px_auto_1fr_80px_120px_100px_80px] gap-3 items-center px-4 py-2.5 border-b border-[#1f1f1f]">
            {["", "", "Name", "Duration", "Created", "Status", ""].map((h, i) => (
              <span key={i} className="text-[10px] font-semibold text-muted-foreground/30 uppercase tracking-wider">{h}</span>
            ))}
          </div>
          {paged.map((clip) => (
            <div
              key={clip.id}
              className={`group grid grid-cols-[24px_auto_1fr] sm:grid-cols-[24px_auto_1fr_80px_120px_100px_80px] gap-3 items-center px-4 py-3.5 border-b border-[#1f1f1f] last:border-0 hover:bg-white/[0.02] transition-colors ${selected.has(clip.id) ? "bg-primary/[0.04]" : ""}`}
            >
              <input
                type="checkbox"
                checked={selected.has(clip.id)}
                onChange={() => toggleSelect(clip.id)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
              <ThumbnailBox name={clip.name} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground/80 truncate">{clip.name}</p>
                <p className="text-[11px] text-muted-foreground/35 sm:hidden">{formatDuration(clip.duration)} · {formatDate(clip.createdAt)}</p>
              </div>
              <span className="hidden sm:block text-sm text-muted-foreground/50 tabular-nums">{formatDuration(clip.duration)}</span>
              <span className="hidden sm:block text-xs text-muted-foreground/40">{formatDate(clip.createdAt)}</span>
              <div className="hidden sm:flex"><ClipStatusBadge status={clip.status} /></div>
              <div className="hidden sm:flex items-center gap-0.5 justify-end">
                {clip.status === "ready" && (
                  <a href={clip.downloadUrl ?? "#"} title="Download" className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.06] transition-all">
                    <Download style={{ width: 13, height: 13 }} />
                  </a>
                )}
                {clip.status === "ready" && (
                  <button title="Copy link" className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.06] transition-all">
                    <Copy style={{ width: 13, height: 13 }} />
                  </button>
                )}
                {clip.status === "failed" && (
                  <button title="Retry" className="w-7 h-7 flex items-center justify-center rounded-md text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/[0.08] transition-all">
                    <RotateCcw style={{ width: 13, height: 13 }} />
                  </button>
                )}
                <button title="Delete" className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                  <Trash2 style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {paged.map((clip) => (
            <div
              key={clip.id}
              className={`group rounded-2xl border border-[#1f1f1f] bg-[#111111] p-3 hover:border-white/[0.12] transition-all cursor-pointer ${selected.has(clip.id) ? "border-primary/30 bg-primary/[0.04]" : ""}`}
              onClick={() => toggleSelect(clip.id)}
            >
              <ThumbnailBox name={clip.name} large />
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-foreground/80 truncate">{clip.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/35 tabular-nums">{formatDuration(clip.duration)}</span>
                  <ClipStatusBadge status={clip.status} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {clip.status === "ready" && (
                  <a href={clip.downloadUrl ?? "#"} onClick={(e) => e.stopPropagation()} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.08] transition-all">
                    <Download style={{ width: 13, height: 13 }} />
                  </a>
                )}
                <button onClick={(e) => { e.stopPropagation(); }} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/[0.08] transition-all ml-auto">
                  <Trash2 style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground/40">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#1f1f1f] text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${p === page ? "bg-primary/15 border border-primary/25 text-primary" : "text-muted-foreground/40 hover:bg-white/[0.05] hover:text-foreground/70"}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#1f1f1f] text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
