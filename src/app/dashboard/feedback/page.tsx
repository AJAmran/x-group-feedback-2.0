import { Suspense } from "react";
import {
  MessageSquare,
  Star,
  SmilePlus,
  BarChart3,
  ThumbsUp,
} from "lucide-react";
import { getFeedbackList, getBranchList, getFeedbackMetrics } from "@/features/dashboard/actions";
import { FeedbackTable } from "./_components/feedback-table";
import { FeedbackFilters } from "./_components/feedback-filters";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Bone, KpiCardSkeleton } from "../../_components/skeleton";

async function RatingDistribution({ metrics }: { metrics: Awaited<ReturnType<typeof getFeedbackMetrics>> }) {
  const ratingLabels: Record<string, string> = {
    EXCELLENT: "Excellent",
    GOOD: "Good",
    AVERAGE: "Average",
    POOR: "Poor",
    VERY_POOR: "Very Poor",
  };
  const ratingBgs: Record<string, string> = {
    EXCELLENT: "bg-emerald-500",
    GOOD: "bg-sky-500",
    AVERAGE: "bg-amber-500",
    POOR: "bg-orange-500",
    VERY_POOR: "bg-red-500",
  };


  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-ios-primary/10 flex items-center justify-center">
            <BarChart3 size={18} className="text-ios-primary" />
          </div>
          <div>
            <h3 className="text-label font-bold text-ios-foreground">Rating Distribution</h3>
            <p className="text-micro text-ios-foreground-faint">Breakdown across all feedback</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10">
            <span className="text-micro font-bold text-emerald-600 dark:text-emerald-400">{metrics.positivePercentage}%</span>
            <span className="text-micro text-ios-foreground-faint">Positive</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {metrics.distribution.map((d) => (
          <div key={d.label} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${ratingBgs[d.label]}`} />
                <span className="text-caption font-semibold text-ios-foreground">{ratingLabels[d.label]}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-caption font-bold text-ios-foreground">{d.count}</span>
                <span className="text-micro font-medium text-ios-foreground-faint w-8 text-right">{d.percentage}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-ios-border-subtle overflow-hidden">
              <div
                className={`h-full rounded-full ${ratingBgs[d.label]} transition-all duration-700`}
                style={{ width: `${Math.max(d.percentage, 2)}%` }}
              />
            </div>
          </div>
        ))}
        {metrics.distribution.length === 0 && (
          <div className="text-center py-6">
            <p className="text-caption text-ios-foreground-faint">No rating data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

async function FeedbackContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const [data, branches, metrics] = await Promise.all([
    getFeedbackList({
      page: Number(params.page) || 1,
      pageSize: 20,
      branchCode: params.branch,
      rating: params.rating,
      status: params.status,
      search: params.search,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    }),
    getBranchList(),
    getFeedbackMetrics(),
  ]);

  return (
    <div className="space-y-6">
      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Feedback"
          value={metrics.totalFeedbacks}
          icon={MessageSquare}
          subtext="All time submissions"
        />
        <KpiCard
          title="Average Rating"
          value={metrics.averageRating.toFixed(1)}
          icon={Star}
          trend={metrics.averageRating >= 4 ? "up" : metrics.averageRating >= 3 ? "neutral" : "down"}
          change={`${metrics.averageRating.toFixed(1)} / 5`}
          subtext="Overall satisfaction"
        />
        <KpiCard
          title="Net Satisfaction (NPS)"
          value={metrics.nps.toFixed(0)}
          icon={SmilePlus}
          trend={metrics.nps >= 50 ? "up" : metrics.nps >= 0 ? "neutral" : "down"}
          change={`${metrics.nps.toFixed(0)} pts`}
          subtext="Net Promoter Score"
        />
        <KpiCard
          title="Positive Rate"
          value={`${metrics.positivePercentage}%`}
          icon={ThumbsUp}
          trend={metrics.positivePercentage >= 70 ? "up" : "down"}
          change={`${metrics.positivePercentage}%`}
          subtext="Rating 4 & 5"
        />
      </div>

      {/* Rating Distribution + Filters side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RatingDistribution metrics={metrics} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <FeedbackFilters branches={branches} />
          <FeedbackTable data={data} />
        </div>
      </div>
    </div>
  );
}

function SkeletonRatingDist() {
  return (
    <div className="glass-card rounded-3xl p-6">
      <Bone className="h-5 w-36 mb-5" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="mb-4">
          <Bone className="h-3 w-full mb-1.5" />
          <Bone className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
}

function SkeletonFiltersTable() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-4 rounded-3xl">
        <Bone className="h-11 w-full" />
      </div>
      <div className="glass-card rounded-3xl">
        <div className="h-64 w-full bg-ios-border-subtle rounded-xl" />
      </div>
    </div>
  );
}

export default function FeedbackPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Feedback Management</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">Review and manage guest feedback across all branches</p>
      </div>

      <Suspense fallback={
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1"><SkeletonRatingDist /></div>
            <div className="lg:col-span-2"><SkeletonFiltersTable /></div>
          </div>
        </div>
      }>
        <FeedbackContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
