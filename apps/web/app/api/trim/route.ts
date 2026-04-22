import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "@repo/db";
import { db } from "@repo/db";
import { trimJob, clip } from "@repo/db/schema";
import { usageEvents, monthlyUsage } from "@repo/db/schema";
import { subscriptions } from "@repo/db/schema";
import { getServerSession } from "@/lib/auth-server";

const trimSchema = z.object({
  url: z.string().url("url must be a valid URL."),
  start: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "start must be HH:MM:SS."),
  end: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "end must be HH:MM:SS."),
  title: z.string().max(500).nullish(),
});

const RUST_SERVER_URL = process.env.RUST_SERVER_URL ?? "http://localhost:3001";
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN ?? "";

function hmsToSeconds(hms: string): number {
  const [h, m, s] = hms.split(":").map(Number);
  return (h ?? 0) * 3600 + (m ?? 0) * 60 + (s ?? 0);
}

type RustTrimResponse = {
  clip_url: string;
  duration_seconds: number;
  file_size_bytes: number;
  processed_at: string;
};

type RustErrorResponse = { error: string };

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = trimSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request.";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }

  const { url, start, end, title } = parsed.data;
  const startSeconds = hmsToSeconds(start);
  const endSeconds = hmsToSeconds(end);

  if (endSeconds <= startSeconds) {
    return NextResponse.json(
      { data: null, error: "end must be after start." },
      { status: 400 },
    );
  }

  // 1. Create trim job record (PENDING)
  const [job] = await db
    .insert(trimJob)
    .values({
      userId: session.user.id,
      status: "PENDING",
      sourceUrl: url,
      startTimeSeconds: startSeconds,
      endTimeSeconds: endSeconds,
    })
    .returning()
    .catch((err) => {
      console.error("[POST /api/trim] Failed to insert trimJob:", err);
      return [];
    });

  if (!job) {
    return NextResponse.json({ data: null, error: "Failed to create trim job." }, { status: 500 });
  }

  const clipId = crypto.randomUUID();

  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, session.user.id),
    with: { plan: true },
  });
  const planType = sub?.plan?.type?.toLowerCase() ?? "free";
  const billingPeriod =
    planType === "pro" && sub?.currentPeriodStart
      ? sub.currentPeriodStart.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 7);

  // 2. Mark PROCESSING
  await db
    .update(trimJob)
    .set({ status: "PROCESSING", updatedAt: new Date() })
    .where(eq(trimJob.id, job.id));

  // 3. Call Rust media server
  let rustRes: Response;
  try {
    rustRes = await fetch(`${RUST_SERVER_URL}/trim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-token": INTERNAL_TOKEN,
      },
      body: JSON.stringify({
        source_url: url,
        start_time: start,
        end_time: end,
        userId: session.user.id,
        clip_id: clipId,
      }),
    });
  } catch (err) {
    console.error("[POST /api/trim] Rust server unreachable:", err);
    await db
      .update(trimJob)
      .set({ status: "FAILED", errorMessage: "Trimming service unavailable.", updatedAt: new Date() })
      .where(eq(trimJob.id, job.id));
    return NextResponse.json(
      { data: null, error: "Trimming service unavailable." },
      { status: 503 },
    );
  }

  const rustBody = await rustRes.json().catch(() => null) as
    | RustTrimResponse
    | RustErrorResponse
    | null;

  if (!rustRes.ok) {
    const message = (rustBody as RustErrorResponse | null)?.error ?? "Trim failed.";
    await db
      .update(trimJob)
      .set({ status: "FAILED", errorMessage: message, updatedAt: new Date() })
      .where(eq(trimJob.id, job.id));
    return NextResponse.json({ data: null, error: message }, { status: rustRes.status });
  }

  const result = rustBody as RustTrimResponse;
  if (!result?.clip_url) {
    await db
      .update(trimJob)
      .set({ status: "FAILED", errorMessage: "No output URL returned.", updatedAt: new Date() })
      .where(eq(trimJob.id, job.id));
    return NextResponse.json({ data: null, error: "Trim failed: no output URL." }, { status: 500 });
  }

  // 4. Persist clip record
  const durationSeconds = Math.round(result.duration_seconds ?? 0);

  const [savedClip] = await db
    .insert(clip)
    .values({
      id: clipId,
      userId: session.user.id,
      jobId: job.id,
      durationSeconds,
      outputUrl: result.clip_url,
      format: "mp4",
      ...(title ? { title } : {}),
    })
    .returning()
    .catch((err) => {
      console.error("[POST /api/trim] Failed to insert clip:", err);
      return [];
    });

  // 5. Update job + log usage events + upsert monthly rollup (parallel, non-blocking on failure)
  await Promise.allSettled([
    db
      .update(trimJob)
      .set({ status: "READY", updatedAt: new Date() })
      .where(eq(trimJob.id, job.id)),

    db.insert(usageEvents).values([
      {
        userId: session.user.id,
        type: "TRIM_JOB_STARTED" as const,
        creditCost: 0,
        billingPeriod,
        trimJobId: job.id,
      },
      {
        userId: session.user.id,
        type: "CLIP_DOWNLOADED" as const,
        creditCost: 1,
        billingPeriod,
        clipId: savedClip?.id ?? null,
        trimJobId: job.id,
      },
    ]),

    db
      .insert(monthlyUsage)
      .values({
        userId: session.user.id,
        billingPeriod,
        clipsDownloaded: 1,
        videosFetched: 0,
        totalCreditsUsed: 1,
        secondsProcessed: durationSeconds,
      })
      .onConflictDoUpdate({
        target: [monthlyUsage.userId, monthlyUsage.billingPeriod],
        set: {
          clipsDownloaded: sql`${monthlyUsage.clipsDownloaded} + 1`,
          totalCreditsUsed: sql`${monthlyUsage.totalCreditsUsed} + 1`,
          secondsProcessed: sql`${monthlyUsage.secondsProcessed} + ${durationSeconds}`,
          updatedAt: new Date(),
        },
      }),
  ]);

  return NextResponse.json({
    data: {
      clipId: savedClip?.id ?? clipId,
      jobId: job.id,
      outputUrl: result.clip_url,
      durationSeconds,
      fileSizeBytes: result.file_size_bytes ?? 0,
      processedAt: result.processed_at,
    },
    error: null,
  });
}
