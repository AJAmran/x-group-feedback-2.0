import { Bone, KpiCardSkeleton } from "../_components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8" aria-label="Loading page…" aria-busy="true">
      <div>
        <Bone className="h-8 w-56 mb-2" />
        <Bone className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div>
        <Bone className="h-5 w-44 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-5 rounded-3xl">
              <Bone className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Bone className="h-5 w-48 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card h-[400px] rounded-4xl" />
          <div className="grid grid-rows-2 gap-6">
            <div className="glass-card rounded-4xl" />
            <div className="glass-card rounded-4xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
