import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/features/auth/actions";
import { getUsers } from "@/features/users/actions";
import { getBranchList } from "@/features/dashboard/actions";
import { UserManagement } from "./_components/user-management";
import { PageHeaderSkeleton, StatsGridSkeleton, TableSkeleton } from "../../_components/skeleton";
import type { UserRole } from "@/types";

async function UsersContent(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await props.searchParams;
  const role = params.role as UserRole | undefined;
  const isActive = params.isActive === "true" ? true : params.isActive === "false" ? false : undefined;

  const [user, data, statsData, branches] = await Promise.all([
    getCurrentUserAction(),
    getUsers({
      page: Number(params.page) || 1,
      limit: 20,
      search: params.search,
      role,
      isActive,
    }),
    // Fetch the full list once to power the overview cards. Management users are
    // few, so a single page covers them; totals stay accurate via the API meta.
    getUsers({ page: 1, limit: 1000 }),
    getBranchList(),
  ]);
  if (user?.role === "BRANCH_MANAGER") redirect("/dashboard");

  const stats = {
    total: statsData.total,
    active: statsData.users.filter((u) => u.isActive).length,
    inactive: statsData.users.filter((u) => !u.isActive).length,
    branchManagers: statsData.users.filter((u) => u.role === "BRANCH_MANAGER").length,
  };

  return <UserManagement data={data} stats={stats} branches={branches} />;
}

export default function UsersPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  return (
    <div className="space-y-5 pb-8">
      <Suspense
        fallback={
          <div className="space-y-5">
            <PageHeaderSkeleton />
            <StatsGridSkeleton count={4} cols="lg:grid-cols-4" />
            <TableSkeleton rows={6} />
          </div>
        }
      >
        <UsersContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
