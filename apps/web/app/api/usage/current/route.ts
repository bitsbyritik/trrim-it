import { NextResponse } from "next/server";
import { eq, and, desc, count } from "@repo/db";
import { db } from "@repo/db";
import { monthlyUsage, creditLedger, clip } from "@repo/db/schema";
import { getServerSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  // Format: "YYYY-MM" — matches billingPeriod column
  const billingPeriod = new Date().toISOString().slice(0, 7);

  try {
    const [usageRows, latestCredit, totalClipsRows] = await Promise.all([
      db
        .select()
        .from(monthlyUsage)
        .where(
          and(
            eq(monthlyUsage.userId, session.user.id),
            eq(monthlyUsage.billingPeriod, billingPeriod),
          ),
        )
        .limit(1),
      db
        .select({ balanceAfter: creditLedger.balanceAfter })
        .from(creditLedger)
        .where(eq(creditLedger.userId, session.user.id))
        .orderBy(desc(creditLedger.createdAt))
        .limit(1),
      db
        .select({ value: count() })
        .from(clip)
        .where(eq(clip.userId, session.user.id)),
    ]);

    const current = usageRows[0] ?? null;

    return NextResponse.json({
      data: {
        billingPeriod,
        clipsDownloaded: current?.clipsDownloaded ?? 0,
        videosFetched: current?.videosFetched ?? 0,
        totalCreditsUsed: current?.totalCreditsUsed ?? 0,
        creditsBalance: latestCredit[0]?.balanceAfter ?? 0,
        totalClipsEver: totalClipsRows[0]?.value ?? 0,
      },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/usage/current]", err);
    return NextResponse.json(
      { data: null, error: "Failed to fetch usage." },
      { status: 500 },
    );
  }
}
