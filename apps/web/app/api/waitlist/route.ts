import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "@repo/db";
import { db } from "@repo/db";
import { waitlist } from "@repo/db/schema";

// ─── Validation ───────────────────────────────────────────────────────────────

const joinSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address."),
  source: z.enum(["DASHBOARD", "LANDING"]).default("LANDING"),
  options: z
    .object({
      notifyMe: z.boolean().default(true),
      foundingMember: z.boolean().default(false),
    })
    .default({ notifyMe: true, foundingMember: false }),
});

// ─── POST /api/waitlist — join or update preferences ─────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request.";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }

  const { email, source, options } = parsed.data;

  try {
    await db
      .insert(waitlist)
      .values({
        email,
        source,
        notifyMe: options.notifyMe,
        foundingMember: options.foundingMember,
        // userId intentionally omitted — only set once real auth is wired
      })
      .onConflictDoUpdate({
        target: waitlist.email,
        set: {
          notifyMe: options.notifyMe,
          foundingMember: options.foundingMember,
        },
      });
  } catch (err) {
    console.error("[POST /api/waitlist]", err);
    return NextResponse.json(
      { data: null, error: "Failed to save. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { success: true }, error: null });
}

// ─── GET /api/waitlist?email=… — check if an email is already registered ─────

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { data: null, error: "email query param is required." },
      { status: 400 },
    );
  }

  const emailValidation = z.string().email();
  if (!emailValidation.safeParse(email).success) {
    return NextResponse.json(
      { data: null, error: "Invalid email address." },
      { status: 400 },
    );
  }

  try {
    const entry = await db
      .select({
        notifyMe: waitlist.notifyMe,
        foundingMember: waitlist.foundingMember,
        source: waitlist.source,
        createdAt: waitlist.createdAt,
      })
      .from(waitlist)
      .where(eq(waitlist.email, email))
      .limit(1);

    return NextResponse.json({
      data: { joined: entry.length > 0, entry: entry[0] ?? null },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/waitlist]", err);
    return NextResponse.json(
      { data: null, error: "Failed to fetch. Please try again." },
      { status: 500 },
    );
  }
}
