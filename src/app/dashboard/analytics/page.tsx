import { Suspense } from "react";
import { getAnalyticsData, getBranchList } from "@/features/dashboard/actions";
import { AnalyticsCharts } from "./_components/analytics-charts";
import { DashboardFilterBar } from "@/components/dashboard/dashboard-filter-bar";
import { ChartCardSkeleton } from "../../_components/skeleton";

function resolveBranchId(branchCode: string | undefined, branches: { id: string; code: string; name: string }[]): string | undefined {
  if (!branchCode) return undefined;
  const matched = branches.find((b) => b.code === branchCode || b.id === branchCode);
  return matched?.id;
}

async function AnalyticsContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const dateFrom = params.dateFrom;
  const dateTo = params.dateTo;
  const branchCode = params.branch;
  const branches = await getBranchList();
  const branchId = resolveBranchId(branchCode, branches);
  const data = await getAnalyticsData(dateFrom, dateTo, branchId);
  const filterKey = `${dateFrom || ""}|${dateTo || ""}|${branchCode || ""}`;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Analytics</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">Advanced feedback analytics and performance metrics</p>
      </div>

      <DashboardFilterBar branches={branches} basePath="/dashboard/analytics" />

      <div key={filterKey}>
        <AnalyticsCharts {...data} />
      </div>
    </div>
  );
}

export default function AnalyticsPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <Suspense fallback={
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Analytics</h1>
          <p className="text-subtitle text-ios-foreground-muted mt-1">Advanced feedback analytics and performance metrics</p>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => <ChartCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <AnalyticsContent searchParams={props.searchParams} />
    </Suspense>
  );
}
