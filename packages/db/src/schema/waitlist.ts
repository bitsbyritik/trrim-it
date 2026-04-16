import { text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { pgTableCreator } from "drizzle-orm/pg-core";
import { user } from "./auth";

const createTable = pgTableCreator((name) => `trrim_${name}`);

export const waitlistSourceEnum = pgEnum("waitlist_source", [
  "DASHBOARD",  // signed up from /dashboard/ai-reels (authenticated)
  "LANDING",    // signed up from landing page /waitlist (may be anonymous)
]);

// ─── waitlist ─────────────────────────────────────────────────────────────────
// AI Reels early-access waitlist.
// userId is nullable — landing page signups may not have an account yet.
// email is unique — re-submissions are treated as upserts in the API.

export const waitlist = createTable("waitlist", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Nullable — anonymous landing-page entries won't have an account yet
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),

  email: text("email").notNull().unique(),

  // Preferences captured in WaitlistForm.tsx
  notifyMe: boolean("notify_me").default(true).notNull(),
  foundingMember: boolean("founding_member").default(false).notNull(),

  source: waitlistSourceEnum("source").default("DASHBOARD").notNull(),

  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
});
