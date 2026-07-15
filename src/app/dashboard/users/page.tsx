import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/features/auth/actions";
import { getUsers } from "@/features/users/actions";
import { UserTable } from "./_components/user-table";
import type { UserRole } from "@/types";

async function UsersContent(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const user = await getCurrentUserAction();
  if (user?.role === "BRANCH_MANAGER") redirect("/dashboard");
  const params = await props.searchParams;
  const data = await getUsers({
    page: Number(params.page) || 1,
    limit: 20,
    search: params.search,
    role: params.role as UserRole | undefined,
  });

  return <UserTable data={data} />;
}

export default function UsersPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">User Management</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">Create and manage admin and branch manager accounts</p>
      </div>

      <Suspense fallback={
        <div className="glass-card rounded-3xl overflow-hidden animate-pulse">
          <div className="px-5 py-4 border-b border-ios-border-subtle">
            <div className="h-4 w-32 bg-ios-border-subtle rounded" />
          </div>
          <div className="p-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-ios-border-subtle rounded-xl" />
            ))}
          </div>
        </div>
      }>
        <UsersContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
