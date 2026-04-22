import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "@repo/db";
import { db } from "@repo/db";
import { clip } from "@repo/db/schema";
import { getServerSession } from "@/lib/auth-server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [found] = await db
    .select({ outputUrl: clip.outputUrl, title: clip.title })
    .from(clip)
    .where(and(eq(clip.id, id), eq(clip.userId, session.user.id)))
    .limit(1);

  if (!found) {
    return NextResponse.json({ error: "Clip not found." }, { status: 404 });
  }

  let fileRes: Response;
  try {
    fileRes = await fetch(found.outputUrl);
  } catch {
    return NextResponse.json({ error: "File unavailable." }, { status: 502 });
  }

  if (!fileRes.ok) {
    return NextResponse.json({ error: "File unavailable." }, { status: 502 });
  }

  const rawName = (found.title ?? "clip").replace(/[^\w\s.-]/g, "_").trim() || "clip";
  const filename = `${rawName}.mp4`;

  const headers = new Headers({
    "Content-Type": "video/mp4",
    "Content-Disposition": `attachment; filename="${filename}"`,
  });
  const length = fileRes.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new NextResponse(fileRes.body, { headers });
}
