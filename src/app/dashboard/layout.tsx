import { Suspense } from "react";
import AuthCheck from "./auth-check";
import { RealtimeSync } from "@/components/dashboard/realtime-sync";
import { PageSkeleton } from "../_components/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AuthCheck>
        <RealtimeSync>{children}</RealtimeSync>
      </AuthCheck>
    </Suspense>
  );
}
