import { Suspense } from "react";
import AuthCheck from "./auth-check";
import DashboardLoading from "./loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AuthCheck>{children}</AuthCheck>
    </Suspense>
  );
}
