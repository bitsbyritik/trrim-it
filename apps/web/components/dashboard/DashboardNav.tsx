"use client";

import { useRouter } from "next/navigation";
import { Scissors, LayoutDashboard, Film, CreditCard, LogOut } from "lucide-react";
import { useSession, signOut } from "@repo/auth/client";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard",         icon: LayoutDashboard, active: true },
  { label: "Clips",     href: "/dashboard/clips",   icon: Film,            active: false },
  { label: "Billing",   href: "/dashboard/billing", icon: CreditCard,      active: false },
];

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const initials =
    parts.length >= 2
      ? `${parts[0]![0]}${parts[parts.length - 1]![0]}`
      : (parts[0]![0] ?? "U");
  return (
    <span className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
      {initials.toUpperCase()}
    </span>
  );
}

export default function DashboardNav() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        <a href="/" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Scissors className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            trrim<span className="text-primary">.it</span>
          </span>
        </a>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ label, href, icon: Icon, active }) => (
            <a
              key={label}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-white/[0.06] text-foreground"
                  : "text-muted-foreground/60 hover:text-foreground/80 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </a>
          ))}
        </nav>

        <div className="flex-1" />

        {session && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <Initials name={session.user.name} />
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-foreground/80 leading-none">{session.user.name}</p>
                <p className="text-[11px] text-muted-foreground/50 leading-none mt-0.5">{session.user.email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground/50 hover:text-foreground/80 hover:bg-white/[0.05] transition-all"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
