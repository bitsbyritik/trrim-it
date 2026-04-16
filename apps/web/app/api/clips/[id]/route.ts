import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "@repo/db";
import { db } from "@repo/db";
import { clip } from "@repo/db/schema";
import { getSession } from "@/lib/dummy-auth";

// ─── Validation ───────────────────────────────────────────────────────────────

const patchClipSchema = z.object({
  title: z.string().min(1, "Title cannot be empty.").max(200, "Title is too long."),
});

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/clips/[id] — fetch a single clip ────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [found] = await db
      .select()
      .from(clip)
      .where(and(eq(clip.id, id), eq(clip.userId, session.id)))
      .limit(1);

    if (!found) {
      return NextResponse.json({ data: null, error: "Clip not found." }, { status: 404 });
    }

    return NextResponse.json({ data: { clip: found }, error: null });
  } catch (err) {
    console.error("[GET /api/clips/:id]", err);
    return NextResponse.json(
      { data: null, error: "Failed to fetch clip." },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/clips/[id] — update clip title ───────────────────────────────

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = patchClipSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request.";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }

  try {
    const [updated] = await db
      .update(clip)
      .set({ title: parsed.data.title })
      .where(and(eq(clip.id, id), eq(clip.userId, session.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ data: null, error: "Clip not found." }, { status: 404 });
    }

    return NextResponse.json({ data: { clip: updated }, error: null });
  } catch (err) {
    console.error("[PATCH /api/clips/:id]", err);
    return NextResponse.json(
      { data: null, error: "Failed to update clip." },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/clips/[id] — remove a clip ──────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(clip)
      .where(and(eq(clip.id, id), eq(clip.userId, session.id)))
      .returning({ id: clip.id });

    if (!deleted) {
      return NextResponse.json({ data: null, error: "Clip not found." }, { status: 404 });
    }

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (err) {
    console.error("[DELETE /api/clips/:id]", err);
    return NextResponse.json(
      { data: null, error: "Failed to delete clip." },
      { status: 500 },
    );
  }
}
