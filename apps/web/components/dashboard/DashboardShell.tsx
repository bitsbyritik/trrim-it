"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import type { DummySession } from "@/lib/dummy-auth";
import type { UsageData } from "@/lib/mock-data";

type Props = {
  session: DummySession;
  usage: Pick<UsageData, "minutesUsed" | "minutesTotal" | "plan">;
  children: React.ReactNode;
};

export default function DashboardShell({ session, usage, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        session={session}
        usage={usage}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center h-14 px-4 border-b border-[#1f1f1f] shrink-0 bg-[#111111]">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.06] transition-all"
          >
            <Menu className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
