import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "@repo/db";
import { db } from "@repo/db";
import { subscriptions, plans } from "@repo/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { isAdminEmail } from "@/lib/admin";

const PLAN_DEFS = [
  { slug: "free", name: "Free",         type: "FREE" as const, monthlyPriceUsdCents: 0,    creditsIncluded: 10 },
  { slug: "payg", name: "Pay As You Go", type: "PAYG" as const, monthlyPriceUsdCents: null, creditsIncluded: null },
  { slug: "pro",  name: "Pro",          type: "PRO"  as const, monthlyPriceUsdCents: 1200, creditsIncluded: 300 },
] as const;

const bodySchema = z.object({
  plan: z.enum(["free", "payg", "pro"]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: "plan must be free, payg, or pro." }, { status: 400 });
  }

  const { plan } = parsed.data;

  // Free = no subscription row (implicit default) — just delete existing subscription
  if (plan === "free") {
    await db.delete(subscriptions).where(eq(subscriptions.userId, session.user.id));
    return NextResponse.json({ data: { plan: "free" }, error: null });
  }

  // Upsert plan seed rows so the FK constraint is satisfiable
  const planDef = PLAN_DEFS.find((p) => p.slug === plan)!;
  await db
    .insert(plans)
    .values({
      name: planDef.name,
      slug: planDef.slug,
      type: planDef.type,
      monthlyPriceUsdCents: planDef.monthlyPriceUsdCents,
      creditsIncluded: planDef.creditsIncluded,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: plans.slug,
      set: { isActive: true },
    });

  const [planRow] = await db.select().from(plans).where(eq(plans.slug, plan)).limit(1);
  if (!planRow) {
    return NextResponse.json({ data: null, error: "Plan not found." }, { status: 500 });
  }

  await db
    .insert(subscriptions)
    .values({
      userId: session.user.id,
      planId: planRow.id,
      status: "ACTIVE",
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: { planId: planRow.id, status: "ACTIVE", updatedAt: new Date() },
    });

  return NextResponse.json({ data: { plan }, error: null });
}
