"use server";

/**
 * Dummy auth — cookie-based fake session.
 * Replace this entire file with real better-auth calls once the backend is wired.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type DummySession = {
  id: string;
  name: string;
  email: string;
};

export async function dummySignIn() {
  const cookieStore = await cookies();
  const session: DummySession = {
    id: "dummy_user_001",
    name: "Demo User",
    email: "demo@trrim.it",
  };
  cookieStore.set("trrim_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  redirect("/dashboard");
}

export async function dummySignOut() {
  const cookieStore = await cookies();
  cookieStore.delete("trrim_session");
  redirect("/");
}

export async function getSession(): Promise<DummySession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("trrim_session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DummySession;
  } catch {
    return null;
  }
}
