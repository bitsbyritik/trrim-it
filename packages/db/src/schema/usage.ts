import { text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { pgTableCreator } from "drizzle-orm/pg-core";
import { unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { trimJob, clip } from "./media";

const createTable = pgTableCreator((name) => `trrim_${name}`);

export const usageEventTypeEnum = pgEnum("usage_event_type", [
  "CLIP_DOWNLOADED",  // user downloaded a trimmed clip — costs 1 credit
  "VIDEO_FETCHED",    // user pasted a URL and fetched video metadata — free
  "TRIM_JOB_STARTED", // Rust FFmpeg job kicked off — free, for observability
]);

// ─── usage_events ─────────────────────────────────────────────────────────────
// Append-only log of every billable (and observable) action.
// Source of truth — monthly_usage is derived from this table.

export const usageEvents = createTable("usage_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  type: usageEventTypeEnum("type").notNull(),

  // Credits charged for this event (0 for free actions)
  creditCost: integer("credit_cost").default(0).notNull(),

  // Billing period this event belongs to — format "YYYY-MM" (e.g. "2026-04")
  billingPeriod: text("billing_period").notNull(),

  // Optional links to the relevant entities
  clipId: text("clip_id").references(() => clip.id, { onDelete: "set null" }),
  trimJobId: text("trim_job_id").references(() => trimJob.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
});

// ─── monthly_usage ────────────────────────────────────────────────────────────
// Aggregated rollup per user per billing period.
// Derived from usage_events — updated via background job or on each event write.

export const monthlyUsage = createTable(
  "monthly_usage",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Format "YYYY-MM" — one row per user per month
    billingPeriod: text("billing_period").notNull(),

    clipsDownloaded: integer("clips_downloaded").default(0).notNull(),
    videosFetched: integer("videos_fetched").default(0).notNull(),
    totalCreditsUsed: integer("total_credits_used").default(0).notNull(),

    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.billingPeriod)]
);
