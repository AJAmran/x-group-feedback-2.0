import { Suspense } from "react";
import { FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ToolbarSkeleton, StatsGridSkeleton, TableCardSkeleton } from "../../../_components/skeleton";
import { InventoryReportView } from "./_components/inventory-report-view";

export default function InventoryReportPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        icon={FileSpreadsheet}
        title="Inventory Report"
        description="Monthly inventory summary across branches with category-level totals"
      />

      <Suspense
        fallback={
          <div className="space-y-5">
            <ToolbarSkeleton inputs={2} actions={3} />
            <StatsGridSkeleton count={5} cols="lg:grid-cols-5" />
            <TableCardSkeleton rows={6} columns={10} />
            <TableCardSkeleton rows={4} columns={6} />
          </div>
        }
      >
        <InventoryReportView />
      </Suspense>
    </div>
  );
}
