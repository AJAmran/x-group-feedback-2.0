import { PageHeaderSkeleton, TableSkeleton } from "../../_components/skeleton";

export default function UsersLoading() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeaderSkeleton />

      <TableSkeleton rows={6} />
    </div>
  );
}
