import { Bone, TableSkeleton } from "../../_components/skeleton";

export default function BranchesLoading() {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Bone className="h-8 w-40 mb-2" />
          <Bone className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-9 w-28" />
          <Bone className="h-9 w-28" />
        </div>
      </div>

      <div className="space-y-6">
        <TableSkeleton rows={8} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl">
              <Bone className="h-4 w-24 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-12 bg-ios-border-subtle rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
