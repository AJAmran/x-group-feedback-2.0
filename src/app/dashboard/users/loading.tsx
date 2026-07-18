import { Bone, TableSkeleton } from "../../_components/skeleton";

export default function UsersLoading() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <Bone className="h-8 w-44 mb-2" />
        <Bone className="h-4 w-72" />
      </div>

      <TableSkeleton rows={6} />
    </div>
  );
}
