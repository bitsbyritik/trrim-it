import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dummy-auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    userId: string;
    email: string;
    options?: { notifyMe: boolean; foundingMember: boolean };
  };

  if (!body.email) {
    return NextResponse.json({ data: null, error: "Email is required" }, { status: 400 });
  }

  // TODO: persist to DB — for now just acknowledge
  return NextResponse.json({
    data: { success: true, message: "You're on the list. We'll reach out before anyone else." },
    error: null,
  });
}
