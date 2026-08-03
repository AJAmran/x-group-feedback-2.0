import { Suspense } from "react";
import { ManagerReportClient } from "./_components/manager-report-client";
import { TableSkeleton } from "../../_components/skeleton";

export default function ManagerReportPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Daily Manager Reports</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">
          Daily operational reports with guest complaints and briefing points
        </p>
      </div>

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <ManagerReportClient />
      </Suspense>
    </div>
  );
}
