import { Suspense } from "react";
import { ClipboardList } from "lucide-react";
import { ManagerReportClient } from "./_components/manager-report-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatsGridSkeleton, ToolbarSkeleton, TableCardSkeleton } from "../../_components/skeleton";

export default function ManagerReportPage() {
  return (
    <div className="space-y-5 pb-8">
      <PageHeader
        icon={ClipboardList}
        title="Daily Manager Reports"
        subtitle="দৈনিক ব্যবস্থাপক রিপোর্ট"
        description="Operational reports with guest complaints and briefing points"
      />

      <Suspense
        fallback={
          <div className="space-y-5">
            <StatsGridSkeleton count={4} />
            <ToolbarSkeleton inputs={3} actions={1} />
            <TableCardSkeleton rows={6} columns={7} />
          </div>
        }
      >
        <ManagerReportClient />
      </Suspense>
    </div>
  );
}
