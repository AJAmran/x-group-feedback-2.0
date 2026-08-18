import { Bone, PageHeaderSkeleton, TableSkeleton } from "../../_components/skeleton";

export default function BranchesLoading() {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <PageHeaderSkeleton />
        </div>
        <div className="flex gap-2 pt-1">
          <Bone className="h-9 w-28 rounded-xl" />
          <Bone className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      <div className="space-y-6">
        <TableSkeleton rows={8} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="glass-card p-6">
              <Bone className="h-4 w-24 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Bone key={j} className="h-12 rounded-xl w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
