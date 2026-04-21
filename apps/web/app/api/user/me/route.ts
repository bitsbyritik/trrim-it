import { NextResponse } from "next/server";
import { eq } from "@repo/db";
import { db } from "@repo/db";
import { user } from "@repo/db/schema";
import { getServerSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [found] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    // Fall back to session data when the dummy user isn't in the DB yet
    const userData = found ?? {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: null,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({ data: { user: userData }, error: null });
  } catch (err) {
    console.error("[GET /api/user/me]", err);
    return NextResponse.json({ data: null, error: "Failed to fetch user." }, { status: 500 });
  }
}
