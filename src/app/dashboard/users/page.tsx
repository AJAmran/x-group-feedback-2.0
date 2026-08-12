import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getCurrentUserAction } from "@/features/auth/actions";
import { getUsers } from "@/features/users/actions";
import { UserTable } from "./_components/user-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableSkeleton } from "../../_components/skeleton";
import type { UserRole } from "@/types";

async function UsersContent(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await props.searchParams;
  const [user, data] = await Promise.all([
    getCurrentUserAction(),
    getUsers({
      page: Number(params.page) || 1,
      limit: 20,
      search: params.search,
      role: params.role as UserRole | undefined,
    }),
  ]);
  if (user?.role === "BRANCH_MANAGER") redirect("/dashboard");

  return <UserTable data={data} />;
}

export default function UsersPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        icon={Users}
        title="User Management"
        description="Create and manage admin and branch manager accounts"
      />

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <UsersContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
