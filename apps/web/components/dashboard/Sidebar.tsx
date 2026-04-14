"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Scissors, LayoutDashboard, Film, BarChart2,
  Sparkles, Settings, ChevronLeft, ChevronRight, LogOut, X, Zap,
} from "lucide-react";
import { dummySignOut, type DummySession } from "@/lib/dummy-auth";
import UsageMeter from "@/components/ui/UsageMeter";
import { usePlan } from "@/hooks/usePlan";
import type { Plan } from "@/lib/mock-data";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "My Clips",  href: "/dashboard/clips",    icon: Film },
  { label: "Usage",     href: "/dashboard/usage",    icon: BarChart2 },
  { label: "AI Reels",  href: "/dashboard/ai-reels", icon: Sparkles, soon: true },
  { label: "Settings",  href: "/dashboard/settings", icon: Settings },
];

const PLAN_BADGE: Record<string, string> = {
  free: "bg-white/[0.06] border-white/10 text-muted-foreground/70",
  payg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  pro:  "bg-primary/10 border-primary/20 text-primary",
};

type Props = {
  session: DummySession;
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

// ── Shared inner content ───────────────────────────────────────
function SidebarContent({
  session, collapsed, onCollapse, onNavClick,
}: {
  session: DummySession;
  collapsed: boolean;
  onCollapse?: (v: boolean) => void;
  onNavClick: () => void;
}) {
  const pathname = usePathname();
  const { plan, credits, minutesUsed, minutesTotal, isLowCredits, openBuyCredits, devSetPlan } = usePlan();
  const initials = session.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const firstName = session.name.split(" ")[0] ?? session.name;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div
      className={`flex flex-col h-full bg-[#111111] border-r border-[#1f1f1f] transition-[width] duration-200 ease-out overflow-hidden ${
        collapsed ? "w-[52px]" : "w-[220px]"
      }`}
    >
      {/* Logo row */}
      <div className={`flex items-center h-14 px-3 border-b border-[#1f1f1f] shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
        <Link href="/dashboard" onClick={onNavClick} className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Scissors className="w-3.5 h-3.5 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight truncate">
              trrim<span className="text-primary">.it</span>
            </span>
          )}
        </Link>
        {!collapsed && onCollapse && (
          <button
            onClick={() => onCollapse(true)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/30 hover:text-foreground/60 hover:bg-white/[0.05] transition-all shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon, exact, soon }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              title={collapsed ? label : undefined}
              className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-100 ${
                active
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground/55 hover:text-foreground/80 hover:bg-white/[0.04]"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon
                className={`shrink-0 ${active ? "text-primary" : "text-muted-foreground/45 group-hover:text-foreground/55"}`}
                style={{ width: 16, height: 16 }}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{label}</span>
                  {soon && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide bg-accent/10 border border-accent/20 text-accent">
                      Soon
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-[#1f1f1f] px-2 py-3 space-y-2.5">
        {!collapsed && (
          <div className="px-2.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${PLAN_BADGE[plan] ?? PLAN_BADGE.free}`}>
                {plan}
              </span>
              {plan === "payg" ? (
                <button
                  onClick={openBuyCredits}
                  className="text-[10px] text-cyan-400/70 hover:text-cyan-400 transition-colors"
                >
                  Buy Credits
                </button>
              ) : (
                <Link
                  href="/dashboard/settings#billing"
                  onClick={onNavClick}
                  className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
                >
                  {plan === "free" ? "Upgrade" : "Billing"}
                </Link>
              )}
            </div>

            {/* Plan-specific balance display */}
            {plan === "payg" ? (
              <div className="flex items-center gap-1.5">
                <Zap className={`w-3 h-3 shrink-0 ${isLowCredits ? "text-amber-400" : "text-cyan-400"}`} />
                <span className={`text-xs font-semibold tabular-nums ${isLowCredits ? "text-amber-300" : "text-cyan-300"}`}>
                  {(credits ?? 0).toFixed(1)} min
                </span>
                {isLowCredits && (
                  <span className="text-[10px] text-amber-400/70 ml-auto">Low</span>
                )}
              </div>
            ) : (
              <UsageMeter used={minutesUsed} total={minutesTotal} unit="min" />
            )}
          </div>
        )}

        {/* Dev plan switcher (non-production only) */}
        {!collapsed && devSetPlan && (
          <div className="px-1">
            <p className="text-[9px] text-muted-foreground/25 uppercase tracking-wider mb-1 px-1.5">Dev: switch plan</p>
            <div className="flex gap-1">
              {(["free", "payg", "pro"] as Plan[]).map((p) => (
                <button
                  key={p}
                  onClick={() => devSetPlan(p)}
                  className={`flex-1 px-1.5 py-1 rounded text-[9px] font-bold uppercase tracking-wide transition-all border ${
                    plan === p
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/35 hover:border-white/10 hover:text-muted-foreground/60"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`flex items-center gap-2 ${collapsed ? "justify-center flex-col" : "px-1"}`}>
          <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground/80 truncate leading-none">{firstName}</p>
                <p className="text-[10px] text-muted-foreground/40 truncate mt-0.5">{session.email}</p>
              </div>
              <form action={dummySignOut}>
                <button
                  type="submit"
                  title="Sign out"
                  className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground/60 hover:bg-white/[0.05] transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>

        {collapsed && onCollapse && (
          <div className="flex justify-center">
            <button
              onClick={() => onCollapse(false)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground/60 hover:bg-white/[0.05] transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Exported sidebar ───────────────────────────────────────────
export default function Sidebar({ session, collapsed, onCollapse, mobileOpen, onMobileClose }: Props) {
  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden lg:flex h-full shrink-0">
        <SidebarContent
          session={session}
          collapsed={collapsed}
          onCollapse={onCollapse}
          onNavClick={() => {}}
        />
      </div>

      {/* Mobile — overlay */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-200 ${mobileOpen ? "visible" : "invisible pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={onMobileClose}
        />
        <div className={`absolute top-0 left-0 h-full transition-transform duration-200 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex flex-col h-full bg-[#111111] border-r border-[#1f1f1f] w-[220px]">
            {/* Mobile logo + close */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-[#1f1f1f] shrink-0">
              <Link href="/dashboard" onClick={onMobileClose} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Scissors className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-bold tracking-tight">
                  trrim<span className="text-primary">.it</span>
                </span>
              </Link>
              <button onClick={onMobileClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground/70">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Reuse content with collapsed=false, no collapse button */}
            <SidebarContent
              session={session}
              collapsed={false}
              onNavClick={onMobileClose}
            />
          </div>
        </div>
      </div>
    </>
  );
}
