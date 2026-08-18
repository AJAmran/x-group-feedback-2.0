import {
  Bone,
  KpiCardSkeleton,
  ListCardSkeleton,
  ChartCardSkeleton,
} from "../_components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 pb-10" aria-label="Loading page…" aria-busy="true">
      {/* OverviewHeader skeleton */}
      <div className="glass-card px-5 sm:px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-3.5 flex-1">
          <Bone className="hidden sm:block w-11 h-11 rounded-2xl" />
          <div className="flex-1 min-w-0">
            <Bone className="h-7 w-56 mb-2" />
            <Bone className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Bone className="h-9 w-64 rounded-xl" />
          <Bone className="h-9 w-36 rounded-xl" />
          <Bone className="h-9 w-9 rounded-xl" />
        </div>
      </div>

      {/* Daily Operations */}
      <div>
        <Bone className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      {/* Feedback Health */}
      <div>
        <Bone className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Insights & Alerts */}
      <div>
        <Bone className="h-5 w-48 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ListCardSkeleton rows={2} />
          <ListCardSkeleton rows={2} />
        </div>
      </div>

      {/* Performance Analytics */}
      <div>
        <Bone className="h-5 w-48 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCardSkeleton height="h-[320px]" />
          <div className="grid grid-rows-2 gap-4">
            <ChartCardSkeleton />
            <ChartCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}