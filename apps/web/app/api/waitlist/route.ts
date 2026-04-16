import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dummy-auth";
import { db } from "@repo/db";
import { waitlist } from "@repo/db/schema";

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

  await db
    .insert(waitlist)
    .values({
      userId: body.userId || session.id,
      email: body.email,
      notifyMe: body.options?.notifyMe ?? true,
      foundingMember: body.options?.foundingMember ?? false,
      source: "DASHBOARD",
    })
    .onConflictDoUpdate({
      target: waitlist.email,
      set: {
        userId: body.userId || session.id,
        notifyMe: body.options?.notifyMe ?? true,
        foundingMember: body.options?.foundingMember ?? false,
      },
    });

  return NextResponse.json({
    data: { success: true, message: "You're on the list. We'll reach out before anyone else." },
    error: null,
  });
}
