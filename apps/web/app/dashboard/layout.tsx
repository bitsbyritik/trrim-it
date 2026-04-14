import { redirect } from "next/navigation";
import { getSession } from "@/lib/dummy-auth";
import { getMockUsage } from "@/lib/mock-data";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const usage = getMockUsage();

  return (
    <DashboardShell
      session={session}
      usage={{ minutesUsed: usage.minutesUsed, minutesTotal: usage.minutesTotal, plan: usage.plan }}
    >
      {children}
    </DashboardShell>
  );
}
