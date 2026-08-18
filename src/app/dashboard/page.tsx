import { Suspense } from "react";
import { Activity, Database } from "lucide-react";
import { getDashboardStats, getAnalyticsData, getBranchList } from "@/features/dashboard/actions";
import { OverviewHeader } from "./_components/overview-header";
import { DailyOperations } from "./_components/daily-operations";
import { SupportingMetrics } from "./_components/supporting-metrics";
import { FeedbackHealth } from "./_components/feedback-health";
import { InsightsAlerts } from "./_components/insights-alerts";
import { ChartsSectionLazy } from "./_components/charts-section-lazy";
import { KpiCardSkeleton, ListCardSkeleton, ChartCardSkeleton, Bone } from "../_components/skeleton";

interface BranchSummary {
  id: string;
  code: string;
  name: string;
}

function resolveBranchId(branchCode: string | undefined, branches: BranchSummary[]): string | undefined {
  if (!branchCode) return undefined;
  const matched = branches.find((b) => b.code === branchCode || b.id === branchCode);
  return matched?.id;
}

async function OperationsSection() {
  return <DailyOperations />;
}

async function KeyMetricsSection({ dateFrom, dateTo, branchId }: { dateFrom?: string; dateTo?: string; branchId?: string }) {
  const stats = await getDashboardStats(dateFrom, dateTo, branchId);
  return <SupportingMetrics stats={stats} />;
}

async function FeedbackHealthSection({ dateFrom, dateTo, branchId }: { dateFrom?: string; dateTo?: string; branchId?: string }) {
  const [stats, analytics] = await Promise.all([
    getDashboardStats(dateFrom, dateTo, branchId),
    getAnalyticsData(dateFrom, dateTo, branchId),
  ]);
  return <FeedbackHealth stats={stats} trend={analytics.trend} />;
}

async function DashboardCharts({ dateFrom, dateTo, branchId }: { dateFrom?: string; dateTo?: string; branchId?: string }) {
  const analytics = await getAnalyticsData(dateFrom, dateTo, branchId);
  return <ChartsSectionLazy data={analytics} />;
}

async function OverviewContent({
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
  const filterKey = `${dateFrom || ""}|${dateTo || ""}|${branchCode || ""}`;

  return (
    <div className="space-y-8 pb-10">
      <OverviewHeader branches={branches} />

      <section>
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <KpiCardSkeleton key={i} />)}
          </div>
        }>
          <OperationsSection />
        </Suspense>
      </section>

      <section>
        <Suspense key={`metrics-${filterKey}`} fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)}
          </div>
        }>
          <KeyMetricsSection dateFrom={dateFrom} dateTo={dateTo} branchId={branchId} />
        </Suspense>
      </section>

      <section>
        <Suspense key={`health-${filterKey}`} fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
          </div>
        }>
          <FeedbackHealthSection dateFrom={dateFrom} dateTo={dateTo} branchId={branchId} />
        </Suspense>
      </section>

      <section>
        <Suspense key={`insights-${filterKey}`} fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => <ListCardSkeleton key={i} rows={2} />)}
          </div>
        }>
          <InsightsAlerts dateFrom={dateFrom} dateTo={dateTo} branchId={branchId} />
        </Suspense>
      </section>

      <section>
        <Suspense key={`charts-${filterKey}`} fallback={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCardSkeleton height="h-[320px]" />
            <div className="grid grid-rows-2 gap-4">
              <ChartCardSkeleton />
              <ChartCardSkeleton />
            </div>
          </div>
        }>
          <DashboardCharts dateFrom={dateFrom} dateTo={dateTo} branchId={branchId} />
        </Suspense>
      </section>

      <footer className="flex items-center justify-between gap-3 text-[0.6875rem] text-ios-foreground-faint font-medium pt-2">
        <span className="inline-flex items-center gap-1.5">
          <Activity size={12} className="text-xg-positive" />
          Live data · updates on refresh
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Database size={12} className="text-xg-secondary" />
          Connected to X-Group backend
        </span>
      </footer>
    </div>
  );
}

export default function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <Suspense fallback={
      <div className="space-y-8 pb-10">
        <div className="glass-card px-5 sm:px-6 py-5">
          <Bone className="h-7 w-56 mb-3" />
          <Bone className="h-4 w-72 max-w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <KpiCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <OverviewContent searchParams={props.searchParams} />
    </Suspense>
  );
}