/**
 * Seed script — plan catalog
 *
 * Run:  bunx tsx packages/db/src/seed.ts
 *
 * Idempotent — safe to re-run. Uses ON CONFLICT (slug) DO UPDATE so existing
 * rows are updated in place rather than duplicated.
 *
 * Pricing source of truth: apps/web/lib/copy.ts → PRICING_TIERS
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { plans } from "./schema/billing";

const conn = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(conn, { casing: "snake_case" });

// ─── Plan definitions ─────────────────────────────────────────────────────────
//
//  FREE  — $0/mo · 10 min/mo included · watermarked · no card required
//  PAYG  — no subscription · $0.10/min · buy credit packs · credits never expire
//  PRO   — $12/mo (or $9/mo billed annually = $108/yr) · 300 min included
//          overage at $0.05/min (handled in application logic, not stored here)
//
// annualPriceUsdCents stored as the per-month equivalent ($108 / 12 = $9 = 900¢)
// ─────────────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Free",
    slug: "free",
    type: "FREE" as const,
    monthlyPriceUsdCents: 0,
    creditsIncluded: 10,   // 10 minutes per billing cycle
    isActive: true,
  },
  {
    name: "Pay As You Go",
    slug: "payg",
    type: "PAYG" as const,
    monthlyPriceUsdCents: null,  // no recurring charge — pay per credit pack
    creditsIncluded: null,       // credits bought separately; 1 credit = 1 min = $0.10
    isActive: true,
  },
  {
    name: "Pro",
    slug: "pro",
    type: "PRO" as const,
    monthlyPriceUsdCents: 1200,  // $12.00 / mo billed monthly
    creditsIncluded: 300,        // 300 minutes per billing cycle; overage at $0.05/min
    isActive: true,
  },
] satisfies (typeof plans.$inferInsert)[];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding plans...");

  const rows = await db
    .insert(plans)
    .values(PLANS)
    .onConflictDoUpdate({
      target: plans.slug,
      set: {
        name: plans.name,
        type: plans.type,
        monthlyPriceUsdCents: plans.monthlyPriceUsdCents,
        creditsIncluded: plans.creditsIncluded,
        isActive: plans.isActive,
        updatedAt: new Date(),
      },
    })
    .returning({ slug: plans.slug, type: plans.type });

  for (const row of rows) {
    console.log(`  ✓ ${row.slug} (${row.type})`);
  }

  console.log("Done.");
  await conn.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
