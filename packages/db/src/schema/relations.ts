import { relations } from "drizzle-orm";
import { user } from "./auth";
import { subscriptions, creditLedger, invoices, plans } from "./billing";
import { trimJob, clip } from "./media";
import { usageEvents, monthlyUsage } from "./usage";
import { waitlist } from "./waitlist";

// ─── user ─────────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [user.id],
    references: [subscriptions.userId],
  }),
  creditLedger: many(creditLedger),
  invoices: many(invoices),
  trimJobs: many(trimJob),
  clips: many(clip),
  usageEvents: many(usageEvents),
  monthlyUsage: many(monthlyUsage),
  waitlistEntry: one(waitlist, {
    fields: [user.id],
    references: [waitlist.userId],
  }),
}));

// ─── subscriptions ────────────────────────────────────────────────────────────

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(user, {
    fields: [subscriptions.userId],
    references: [user.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

// ─── plans ────────────────────────────────────────────────────────────────────

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

// ─── credit_ledger ────────────────────────────────────────────────────────────

export const creditLedgerRelations = relations(creditLedger, ({ one }) => ({
  user: one(user, {
    fields: [creditLedger.userId],
    references: [user.id],
  }),
  clip: one(clip, {
    fields: [creditLedger.clipId],
    references: [clip.id],
  }),
}));

// ─── invoices ─────────────────────────────────────────────────────────────────

export const invoicesRelations = relations(invoices, ({ one }) => ({
  user: one(user, {
    fields: [invoices.userId],
    references: [user.id],
  }),
}));

// ─── media ────────────────────────────────────────────────────────────────────

export const trimJobRelations = relations(trimJob, ({ one, many }) => ({
  user: one(user, {
    fields: [trimJob.userId],
    references: [user.id],
  }),
  clips: many(clip),
}));

// ─── usage ────────────────────────────────────────────────────────────────────

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  user: one(user, {
    fields: [usageEvents.userId],
    references: [user.id],
  }),
  clip: one(clip, {
    fields: [usageEvents.clipId],
    references: [clip.id],
  }),
  trimJob: one(trimJob, {
    fields: [usageEvents.trimJobId],
    references: [trimJob.id],
  }),
}));

export const monthlyUsageRelations = relations(monthlyUsage, ({ one }) => ({
  user: one(user, {
    fields: [monthlyUsage.userId],
    references: [user.id],
  }),
}));

// ─── waitlist ─────────────────────────────────────────────────────────────────

export const waitlistRelations = relations(waitlist, ({ one }) => ({
  user: one(user, {
    fields: [waitlist.userId],
    references: [user.id],
  }),
}));

export const clipRelations = relations(clip, ({ one, many }) => ({
  user: one(user, {
    fields: [clip.userId],
    references: [user.id],
  }),
  job: one(trimJob, {
    fields: [clip.jobId],
    references: [trimJob.id],
  }),
  creditLedgerEntries: many(creditLedger),
}));
