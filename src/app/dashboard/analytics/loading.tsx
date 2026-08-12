import { ChartCardSkeleton, PageHeaderSkeleton } from "../../_components/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeaderSkeleton />

      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ChartCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
