import { Suspense } from "react";
import AuthCheck from "./auth-check";
import { PageSkeleton } from "../_components/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AuthCheck>{children}</AuthCheck>
    </Suspense>
  );
}
