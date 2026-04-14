import { NextRequest, NextResponse } from "next/server";
import { getMockClips } from "@/lib/mock-data";
import { getSession } from "@/lib/dummy-auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const limit = Number(searchParams.get("limit") ?? 20);
  const offset = Number(searchParams.get("offset") ?? 0);

  const { clips, total } = getMockClips(limit, offset);
  return NextResponse.json({
    data: { clips, total, page: Math.floor(offset / limit) + 1, pageSize: limit },
    error: null,
  });
}
