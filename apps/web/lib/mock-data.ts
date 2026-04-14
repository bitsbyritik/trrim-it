// ─────────────────────────────────────────────────────────────
//  Mock data — replace each function with real API/DB calls
// ─────────────────────────────────────────────────────────────

export type Plan = "free" | "payg" | "pro";
export type ClipStatus = "processing" | "ready" | "failed";
export type BillingStatus = "paid" | "pending" | "failed";

export type User = {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  waitlisted: boolean;
  joinedAt: string;
};

export type Clip = {
  id: string;
  name: string;
  sourceUrl: string;
  duration: number; // seconds
  createdAt: string;
  status: ClipStatus;
  downloadUrl?: string;
  thumbnailUrl?: string;
};

export type DailyUsage = {
  date: string; // YYYY-MM-DD
  minutes: number;
  clips: number;
};

export type UsageData = {
  period: { start: string; end: string };
  plan: Plan;
  minutesUsed: number;
  minutesTotal: number;
  clipsThisMonth: number;
  clipsRemaining: number;
  totalClipsEver: number;
  creditsBalance: number;
  overageAmount: number;
  dailyUsage: DailyUsage[];
};

export type BillingEntry = {
  id: string;
  date: string;
  description: string;
  amount: number; // cents
  status: BillingStatus;
  invoiceUrl?: string;
};

// ── Mock records ───────────────────────────────────────────────

export const MOCK_USER: User = {
  id: "dummy_user_001",
  name: "Demo User",
  email: "demo@trrim.it",
  plan: "free",
  waitlisted: false,
  joinedAt: "2026-04-01T00:00:00Z",
};

export const MOCK_CLIPS: Clip[] = [
  {
    id: "c1",
    name: "Product Demo Highlight",
    sourceUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    duration: 87,
    createdAt: "2026-04-14T10:23:00Z",
    status: "ready",
    downloadUrl: "#",
  },
  {
    id: "c2",
    name: "Conference Talk Snippet",
    sourceUrl: "https://youtube.com/watch?v=abc123",
    duration: 42,
    createdAt: "2026-04-13T15:11:00Z",
    status: "ready",
    downloadUrl: "#",
  },
  {
    id: "c3",
    name: "Tutorial Clip",
    sourceUrl: "https://vimeo.com/123456789",
    duration: 120,
    createdAt: "2026-04-15T09:00:00Z",
    status: "processing",
  },
  {
    id: "c4",
    name: "Interview Extract",
    sourceUrl: "https://youtube.com/watch?v=xyz987",
    duration: 55,
    createdAt: "2026-04-12T18:44:00Z",
    status: "failed",
  },
];

function buildDailyUsage(): DailyUsage[] {
  const entries: DailyUsage[] = [];
  for (let d = 1; d <= 15; d++) {
    const day = String(d).padStart(2, "0");
    entries.push({
      date: `2026-04-${day}`,
      minutes: d % 3 === 0 ? 0 : parseFloat((Math.random() * 2.5).toFixed(1)),
      clips: d % 3 === 0 ? 0 : Math.floor(Math.random() * 3),
    });
  }
  return entries;
}

export const MOCK_USAGE: UsageData = {
  period: { start: "2026-04-01", end: "2026-04-30" },
  plan: "free",
  minutesUsed: 3.5,
  minutesTotal: 10,
  clipsThisMonth: 2,
  clipsRemaining: 3,
  totalClipsEver: 4,
  creditsBalance: 10,
  overageAmount: 0,
  dailyUsage: buildDailyUsage(),
};

export const MOCK_BILLING: BillingEntry[] = [];

// ── Accessor functions ─────────────────────────────────────────

export function getMockUser(): User {
  return MOCK_USER;
}

export function getMockClips(limit = 20, offset = 0): { clips: Clip[]; total: number } {
  const slice = MOCK_CLIPS.slice(offset, offset + limit);
  return { clips: slice, total: MOCK_CLIPS.length };
}

export function getMockUsage(): UsageData {
  return MOCK_USAGE;
}

export function getMockBilling(): BillingEntry[] {
  return MOCK_BILLING;
}

// ── Helpers ────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
