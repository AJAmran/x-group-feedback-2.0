import { Bone, KpiCardSkeleton, TableSkeleton } from "../../_components/skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <Bone className="h-8 w-40 mb-2" />
        <Bone className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bone className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-3.5 bg-ios-border-subtle/30">
              <Bone className="h-3 w-16 mb-2" />
              <Bone className="h-7 w-10 mb-1" />
              <Bone className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      <TableSkeleton rows={6} />
    </div>
  );
}
