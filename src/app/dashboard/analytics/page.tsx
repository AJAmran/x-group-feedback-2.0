import { Suspense } from "react";
import { BarChart3 } from "lucide-react";
import { getAnalyticsData, getBranchList } from "@/features/dashboard/actions";
import { AnalyticsChartsLazy } from "./_components/analytics-charts-lazy";
import { DashboardFilterBar } from "@/components/dashboard/dashboard-filter-bar";
import { PageHeader } from "@/components/dashboard/page-header";
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
      <PageHeader
        icon={BarChart3}
        title="Analytics"
        description="Advanced feedback analytics and performance metrics"
      />

      <DashboardFilterBar branches={branches} basePath="/dashboard/analytics" />

      <div key={filterKey}>
        <AnalyticsChartsLazy {...data} />
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
        <PageHeader
          icon={BarChart3}
          title="Analytics"
          description="Advanced feedback analytics and performance metrics"
        />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => <ChartCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <AnalyticsContent searchParams={props.searchParams} />
    </Suspense>
  );
}
