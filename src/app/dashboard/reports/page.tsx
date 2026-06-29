import { Suspense } from "react";
import { getReportMetrics } from "@/features/dashboard/actions";
import { ReportClient } from "./report-client";
import { MessageSquare, Star, ThumbsUp, CalendarCheck, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";

async function ReportContent() {
  const data = await getReportMetrics();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Feedback" value={data.totalFeedbacks} icon={MessageSquare} subtext="All time submissions" />
        <KpiCard title="Average Rating" value={data.averageRating.toFixed(1)} icon={Star} trend={data.averageRating >= 4 ? "up" : data.averageRating >= 3 ? "neutral" : "down"} change={`${data.averageRating.toFixed(1)} / 5`} subtext="Overall satisfaction" />
        <KpiCard title="This Week" value={data.thisWeek} icon={TrendingUp} subtext="New submissions" />
        <KpiCard title="This Month" value={data.thisMonth} icon={CalendarCheck} subtext="Monthly count" />
      </div>

      <ReportClient data={data} />
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 rounded-3xl animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-ios-border-subtle mb-3" />
            <div className="h-3 w-20 bg-ios-border-subtle rounded mb-2" />
            <div className="h-8 w-28 bg-ios-border-subtle rounded" />
          </div>
        ))}
      </div>
      <div className="glass-card rounded-3xl animate-pulse">
        <div className="h-64 w-full bg-ios-border-subtle rounded-xl" />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Reports</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">Generate and export feedback reports across all branches</p>
      </div>

      <Suspense fallback={<SkeletonSection />}>
        <ReportContent />
      </Suspense>
    </div>
  );
}
