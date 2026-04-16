import { text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { pgTableCreator } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { clip } from "./media";

const createTable = pgTableCreator((name) => `trrim_${name}`);

export const planTypeEnum = pgEnum("plan_type", ["FREE", "PAYG", "PRO"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "CANCELLED",
  "PAST_DUE",
  "TRIALING",
]);

export const creditTxTypeEnum = pgEnum("credit_tx_type", [
  "FREE_GRANT",
  "PURCHASE",
  "CONSUMED",
  "REFUND",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "VOID",
]);

// Static catalog of plan tiers. Seeded, not user-created.

export const plans = createTable("plans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: planTypeEnum("type").notNull(),

  // Monthly price in USD cents; 0 for FREE, null for PAYG (no recurring charge)
  monthlyPriceUsdCents: integer("monthly_price_usd_cents"),

  // Credits included per billing cycle; null = no allowance (PAYG, buy separately)
  creditsIncluded: integer("credits_included"),

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date()),
});

// ─── subscriptions ────────────────────────────────────────────────────────────
// Created only when a user upgrades to PAYG or PRO.
// No row = user is on the FREE plan (implicit default — no insert needed on signup).
// Always query with LEFT JOIN and fall back to FREE when null.

export const subscriptions = createTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),

  status: subscriptionStatusEnum("status").default("ACTIVE").notNull(),

  // Polar IDs (null for FREE plan — no payment provider involvement)
  providerCustomerId: text("provider_customer_id").unique(),
  providerSubscriptionId: text("provider_subscription_id").unique(),

  // Billing cycle window; null for FREE/PAYG (no recurring period)
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),

  cancelledAt: timestamp("cancelled_at"),

  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date()),
});

// ─── credit_ledger ────────────────────────────────────────────────────────────
// Append-only log of every credit movement (PAYG credit transactions).
// Current balance = sum of `amount` for a userId, or read `balanceAfter` on the latest row.

export const creditLedger = createTable("credit_ledger", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Positive = credits added, negative = credits spent
  amount: integer("amount").notNull(),

  type: creditTxTypeEnum("type").notNull(),

  // Running balance snapshot after this transaction — avoids full table scan for current balance
  balanceAfter: integer("balance_after").notNull(),

  // Linked clip (set for CONSUMED / REFUND)
  clipId: text("clip_id").references(() => clip.id, { onDelete: "set null" }),

  // Linked Polar payment (set for PURCHASE)
  providerPaymentId: text("provider_payment_id"),

  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
});

// ─── invoices ─────────────────────────────────────────────────────────────────
// One row per payment event — credit pack purchases and future subscription charges.

export const invoices = createTable("invoices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Polar invoice / checkout ID
  providerInvoiceId: text("provider_invoice_id").unique(),
  providerCustomerId: text("provider_customer_id"),

  amountUsdCents: integer("amount_usd_cents").notNull(),
  status: invoiceStatusEnum("status").default("PENDING").notNull(),

  // For PAYG pack purchases — how many credits this invoice granted
  creditsPurchased: integer("credits_purchased"),

  paidAt: timestamp("paid_at"),

  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date()),
});
