"use client";

import { useState } from "react";
import { User, CreditCard, Key, Bell, AlertTriangle, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useSession } from "@repo/auth/client";
import Modal from "@/components/ui/Modal";
import { usePlan } from "@/hooks/usePlan";
import { isAdminEmail } from "@/lib/admin";
import type { Plan } from "@/lib/mock-data";

type Tab = "profile" | "billing" | "api" | "notifications" | "danger";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile",       label: "Profile",        icon: User },
  { id: "billing",       label: "Plan & Billing",  icon: CreditCard },
  { id: "api",           label: "API Access",      icon: Key },
  { id: "notifications", label: "Notifications",   icon: Bell },
  { id: "danger",        label: "Danger Zone",     icon: AlertTriangle },
];

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free tier — 10 min / month, up to 5 clips",
  payg: "Pay As You Go — pay per minute trimmed",
  pro:  "Pro — 300 min / month, unlimited clips",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] divide-y divide-[#1f1f1f] overflow-hidden">
      <div className="px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground/80">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground/60">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/35">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full bg-background border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/40 transition-colors";
const btnPrimary = "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all active:scale-[0.99]";
const btnOutline = "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1f1f1f] text-sm font-medium text-foreground/70 hover:border-white/[0.15] hover:text-foreground/90 transition-all";

function ProfileTab() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user.name ?? "");
  const [email] = useState(session?.user.email ?? "");

  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <Section title="Profile">
      <Field label="Display name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Email address" hint="Email is managed by your Google account.">
        <input className={inputCls} type="email" value={email} readOnly />
      </Field>
      <Field label="Avatar">
        <div className="flex items-center gap-4">
          {session?.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" className="w-14 h-14 rounded-full object-cover border border-primary/20" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-lg font-bold text-primary">
              {initials}
            </div>
          )}
        </div>
      </Field>
      <div className="pt-1">
        <button className={btnPrimary}>Save changes</button>
      </div>
    </Section>
  );
}

const PLAN_BADGE_CLS: Record<Plan, string> = {
  free: "bg-white/[0.06] border-white/10 text-muted-foreground/70",
  payg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  pro:  "bg-primary/10 border-primary/20 text-primary",
};

function BillingTab() {
  const { data: session } = useSession();
  const { plan } = usePlan();
  const isAdmin = session ? isAdminEmail(session.user.email) : false;

  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const handlePlanSwitch = async (newPlan: Plan) => {
    if (newPlan === plan) return;
    setSwitching(true);
    setSwitchError(null);
    try {
      const res = await fetch("/api/admin/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) {
        setSwitchError(json.error ?? "Failed to switch plan.");
      } else {
        window.location.reload();
      }
    } catch {
      setSwitchError("Network error.");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Section title="Plan & Billing">
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm font-semibold text-foreground/80">Current plan</p>
          <p className="text-xs text-muted-foreground/45 mt-0.5">{PLAN_LABELS[plan]}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${PLAN_BADGE_CLS[plan]}`}>
          {plan}
        </span>
      </div>

      {/* Admin plan switcher — only visible for admin email */}
      {isAdmin && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 space-y-3">
          <p className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider">
            Admin override — switch plan
          </p>
          <div className="flex gap-2">
            {(["free", "payg", "pro"] as Plan[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePlanSwitch(p)}
                disabled={switching || p === plan}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                  p === plan
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/[0.08] bg-white/[0.02] text-muted-foreground/50 hover:border-white/20 hover:text-foreground/70"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {switchError && <p className="text-xs text-red-400/80">{switchError}</p>}
        </div>
      )}

      {!isAdmin && (
        <div className="flex flex-wrap gap-2 pt-1">
          <button className={btnPrimary}>Upgrade to Pro — $12/mo</button>
          <button className={btnOutline}>Buy credits (PAYG)</button>
        </div>
      )}

      <div className="pt-2 border-t border-[#1f1f1f]">
        <p className="text-xs text-muted-foreground/35 mb-3">Manage subscription</p>
        <button className="text-xs text-red-400/70 hover:text-red-400 transition-colors">
          Cancel subscription
        </button>
      </div>
    </Section>
  );
}

function APITab() {
  const [key] = useState("sk_trrim_demo_xxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  const [visible, setVisible] = useState(false);
  const display = visible ? key : key.slice(0, 12) + "•".repeat(24);

  return (
    <Section title="API Access">
      <Field label="API Key" hint="Use this key to authenticate requests to the trrim.it API. Keep it secret.">
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-background border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-sm font-mono text-foreground/70 truncate">
            {display}
          </code>
          <button
            onClick={() => setVisible((v) => !v)}
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-[#1f1f1f] text-muted-foreground/40 hover:text-foreground/70 hover:border-white/[0.12] transition-all"
          >
            {visible ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
          </button>
          <button className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-[#1f1f1f] text-muted-foreground/40 hover:text-foreground/70 hover:border-white/[0.12] transition-all" title="Regenerate key">
            <RefreshCw style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </Field>
      <p className="text-xs text-muted-foreground/40">
        View <a href="#" className="text-primary hover:underline">API documentation →</a>
      </p>
    </Section>
  );
}

function NotificationsTab() {
  const prefs = [
    { id: "clips_ready", label: "Clip ready",     sub: "When a trim finishes processing" },
    { id: "clips_failed", label: "Clip failed",   sub: "When a trim fails to process" },
    { id: "usage_80",  label: "Usage warning",    sub: "When you hit 80% of your monthly quota" },
    { id: "billing",   label: "Billing updates",  sub: "Receipts and plan changes" },
    { id: "product",   label: "Product updates",  sub: "New features and announcements" },
  ];
  const [checked, setChecked] = useState<Set<string>>(new Set(["clips_ready", "clips_failed", "usage_80"]));

  const toggle = (id: string) =>
    setChecked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <Section title="Email Notifications">
      <div className="space-y-4">
        {prefs.map(({ id, label, sub }) => (
          <label key={id} className="flex items-center gap-4 cursor-pointer group" onClick={() => toggle(id)}>
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${checked.has(id) ? "bg-primary border-primary" : "border-white/20 bg-white/[0.03] group-hover:border-white/30"}`}
            >
              {checked.has(id) && (
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/75">{label}</p>
              <p className="text-xs text-muted-foreground/40">{sub}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="pt-2">
        <button className={btnPrimary}>Save preferences</button>
      </div>
    </Section>
  );
}

function DangerZoneTab() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  return (
    <>
      <Section title="Danger Zone">
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-semibold text-red-400/80">Delete account</p>
            <p className="text-xs text-muted-foreground/40 mt-0.5 max-w-sm">
              Permanently delete your account and all associated clips. This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/25 text-red-400/80 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/[0.06] text-sm font-medium transition-all"
          >
            Delete account
          </button>
        </div>
      </Section>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete account">
        <p className="text-sm text-muted-foreground/60 mb-4 leading-relaxed">
          This will permanently delete your account, all clips, and billing data. Type{" "}
          <strong className="text-foreground/80">delete my account</strong> to confirm.
        </p>
        <input
          className={`${inputCls} mb-4`}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="delete my account"
        />
        <div className="flex gap-2">
          <button
            disabled={confirmText !== "delete my account"}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-500/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
          >
            Delete permanently
          </button>
          <button onClick={() => setConfirmOpen(false)} className={btnOutline}>Cancel</button>
        </div>
      </Modal>
    </>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  const panels: Record<Tab, React.ReactNode> = {
    profile:       <ProfileTab />,
    billing:       <BillingTab />,
    api:           <APITab />,
    notifications: <NotificationsTab />,
    danger:        <DangerZoneTab />,
  };

  return (
    <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <div className="flex items-center gap-1 flex-wrap border-b border-[#1f1f1f] pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === id
                ? `border-primary text-foreground ${id === "danger" ? "text-red-400 border-red-400" : ""}`
                : `border-transparent text-muted-foreground/50 hover:text-foreground/70 hover:border-white/[0.12] ${id === "danger" ? "hover:text-red-400/70" : ""}`
            }`}
          >
            <Icon style={{ width: 14, height: 14 }} />
            {label}
          </button>
        ))}
      </div>

      {panels[tab]}
    </div>
  );
}
