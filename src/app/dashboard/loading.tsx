import {
  Bone,
  KpiCardSkeleton,
  ListCardSkeleton,
  ChartCardSkeleton,
  PageHeaderSkeleton,
} from "../_components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading page…" aria-busy="true">
      <PageHeaderSkeleton />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div>
        <Bone className="h-5 w-44 mb-4" />
        <ListCardSkeleton rows={3} />
      </div>

      <div>
        <Bone className="h-5 w-48 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCardSkeleton height="h-[400px]" />
          <div className="grid grid-rows-2 gap-6">
            <ChartCardSkeleton />
            <ChartCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
