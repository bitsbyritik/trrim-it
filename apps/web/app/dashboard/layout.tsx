import { redirect } from "next/navigation";
import { getSession } from "@/lib/dummy-auth";
import { MOCK_USER } from "@/lib/mock-data";
import { getPlanData } from "@/lib/mock-users";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const initialPlanData = getPlanData(MOCK_USER.plan);

  return (
    <DashboardShell session={session} initialPlanData={initialPlanData}>
      {children}
    </DashboardShell>
  );
}
