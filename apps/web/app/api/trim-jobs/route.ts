import { NextResponse } from "next/server";
import { and, desc, inArray, eq, gte } from "@repo/db";
import { db } from "@repo/db";
import { trimJob } from "@repo/db/schema";
import { getServerSession } from "@/lib/auth-server";

// Only surface jobs created within the last 30 min — anything older is stuck.
const ACTIVE_WINDOW_MS = 30 * 60 * 1000;

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS);

    const jobs = await db
      .select({
        id: trimJob.id,
        sourceUrl: trimJob.sourceUrl,
        status: trimJob.status,
        createdAt: trimJob.createdAt,
      })
      .from(trimJob)
      .where(
        and(
          eq(trimJob.userId, session.user.id),
          inArray(trimJob.status, ["PENDING", "PROCESSING"]),
          gte(trimJob.createdAt, cutoff),
        ),
      )
      .orderBy(desc(trimJob.createdAt))
      .limit(5);

    return NextResponse.json({ data: { jobs }, error: null });
  } catch (err) {
    console.error("[GET /api/trim-jobs]", err);
    return NextResponse.json({ data: null, error: "Failed to fetch jobs." }, { status: 500 });
  }
}
