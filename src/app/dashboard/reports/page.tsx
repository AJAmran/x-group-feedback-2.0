import { Suspense } from "react";
import { getReportMetrics } from "@/features/dashboard/actions";
import { ReportClient } from "./report-client";
import { MessageSquare, Star, CalendarCheck, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Bone, KpiCardSkeleton } from "../../_components/skeleton";

async function ReportContent(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.searchParams;
  const data = await getReportMetrics(params.dateFrom, params.dateTo);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Feedback" value={data.totalFeedbacks} icon={MessageSquare} subtext="All time submissions" />
        <KpiCard title="Average Rating" value={data.averageRating.toFixed(1)} icon={Star} trend={data.averageRating >= 4 ? "up" : data.averageRating >= 3 ? "neutral" : "down"} change={`${data.averageRating.toFixed(1)} / 5`} subtext="Overall satisfaction" />
        <KpiCard title="This Week" value={data.thisWeek} icon={TrendingUp} subtext="New submissions" />
        <KpiCard title="This Month" value={data.thisMonth} icon={CalendarCheck} subtext="Monthly count" />
      </div>

      <ReportClient data={data} dateFrom={params.dateFrom} dateTo={params.dateTo} />
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
      </div>
      <div className="glass-card rounded-3xl">
        <div className="h-64 w-full bg-ios-border-subtle rounded-xl" />
      </div>
    </div>
  );
}

export default function ReportsPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Reports</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">Generate and export feedback reports across all branches</p>
      </div>

      <Suspense fallback={<SkeletonSection />}>
        <ReportContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
