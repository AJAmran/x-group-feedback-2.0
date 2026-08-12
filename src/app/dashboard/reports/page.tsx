import { Suspense } from "react";
import { getReportMetrics } from "@/features/dashboard/actions";
import { ReportClient } from "./report-client";
import { MessageSquare, Star, CalendarCheck, TrendingUp, FileText } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Bone, KpiCardSkeleton } from "../../_components/skeleton";

async function ReportContent(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.searchParams;
  const data = await getReportMetrics(params.dateFrom, params.dateTo);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Feedback" value={data.totalFeedbacks} icon={MessageSquare} accent="navy" subtext="All time submissions" />
        <KpiCard title="Average Rating" value={data.averageRating.toFixed(1)} icon={Star} accent="gold" trend={data.averageRating >= 4 ? "up" : data.averageRating >= 3 ? "neutral" : "down"} change={`${data.averageRating.toFixed(1)} / 5`} subtext="Overall satisfaction" />
        <KpiCard title="This Week" value={data.thisWeek} icon={TrendingUp} accent="green" subtext="New submissions" />
        <KpiCard title="This Month" value={data.thisMonth} icon={CalendarCheck} accent="navy" subtext="Monthly count" />
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
        <Bone className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function ReportsPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        icon={FileText}
        title="Reports"
        description="Generate and export feedback reports across all branches"
      />

      <Suspense fallback={<SkeletonSection />}>
        <ReportContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
