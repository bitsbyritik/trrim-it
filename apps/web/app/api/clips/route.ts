import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc, count } from "@repo/db";
import { db } from "@repo/db";
import { clip } from "@repo/db/schema";
import { getServerSession } from "@/lib/auth-server";

const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN ?? "";

// ─── Validation ───────────────────────────────────────────────────────────────

// Called by the Rust server after a trim job reaches READY status.
const createClipSchema = z.object({
  userId: z.string().min(1, "userId is required."),
  jobId: z.string().min(1, "jobId is required."),
  durationSeconds: z.number().int().positive("durationSeconds must be a positive integer."),
  outputUrl: z.string().url("outputUrl must be a valid URL."),
  title: z.string().optional(),
  format: z.string().optional(),
});

// ─── GET /api/clips — list clips for current user (paginated) ─────────────────

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 100);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);

  try {
    const [clips, totalRows] = await Promise.all([
      db
        .select()
        .from(clip)
        .where(eq(clip.userId, session.user.id))
        .orderBy(desc(clip.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ value: count() })
        .from(clip)
        .where(eq(clip.userId, session.user.id)),
    ]);

    return NextResponse.json({
      data: {
        clips,
        total: totalRows[0]?.value ?? 0,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
      },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/clips]", err);
    return NextResponse.json(
      { data: null, error: "Failed to fetch clips." },
      { status: 500 },
    );
  }
}

// ─── POST /api/clips — called by Rust server when a trim job reaches READY ────
// Auth: INTERNAL_TOKEN (not user session — the Rust server has no cookie).

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!INTERNAL_TOKEN || authHeader !== `Bearer ${INTERNAL_TOKEN}`) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = createClipSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request.";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }

  const { userId, jobId, durationSeconds, outputUrl, title, format } = parsed.data;

  try {
    const [created] = await db
      .insert(clip)
      .values({
        userId,
        jobId,
        durationSeconds,
        outputUrl,
        ...(title !== undefined && { title }),
        ...(format !== undefined && { format }),
      })
      .returning();

    return NextResponse.json({ data: { clip: created }, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/clips]", err);
    return NextResponse.json(
      { data: null, error: "Failed to create clip." },
      { status: 500 },
    );
  }
}
