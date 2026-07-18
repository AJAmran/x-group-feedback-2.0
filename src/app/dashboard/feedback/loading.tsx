import { Bone, KpiCardSkeleton, TableSkeleton } from "../../_components/skeleton";

export default function FeedbackLoading() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <Bone className="h-8 w-52 mb-2" />
        <Bone className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-6">
          <Bone className="h-5 w-36 mb-5" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-4">
              <Bone className="h-3 w-full mb-1.5" />
              <Bone className="h-2 w-full" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-4 rounded-3xl">
            <Bone className="h-11 w-full" />
          </div>
          <TableSkeleton rows={8} />
        </div>
      </div>
    </div>
  );
}
