import { NextResponse } from "next/server";
import { getMockUsage } from "@/lib/mock-data";
import { getSession } from "@/lib/dummy-auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ data: getMockUsage(), error: null });
}
