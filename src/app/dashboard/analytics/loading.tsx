import { Bone, ChartCardSkeleton } from "../../_components/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <Bone className="h-8 w-40 mb-2" />
        <Bone className="h-4 w-72" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ChartCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
