import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/features/auth/actions";
import { DashboardLayoutClient } from "./dashboard-layout-client";

export default async function AuthCheck({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserAction();
  if (!user) redirect("/login");

  return (
    <DashboardLayoutClient role={user.role} userName={user.name} branchId={user.branchId}>
      {children}
    </DashboardLayoutClient>
  );
}
