import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getUserPlanData } from "@/lib/plan-data";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) redirect("/");

  const planData = await getUserPlanData(session.user.id);

  return (
    <DashboardShell session={session.user} initialPlanData={planData}>
      {children}
    </DashboardShell>
  );
}
