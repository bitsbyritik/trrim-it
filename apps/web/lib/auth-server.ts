import "server-only";
import { auth } from "@repo/auth";
import { headers } from "next/headers";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}
