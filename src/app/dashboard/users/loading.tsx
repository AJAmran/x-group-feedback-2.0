import { PageHeaderSkeleton, StatsGridSkeleton, TableSkeleton } from "../../_components/skeleton";

export default function UsersLoading() {
  return (
    <div className="space-y-5 pb-8">
      <PageHeaderSkeleton />
      <StatsGridSkeleton count={4} cols="lg:grid-cols-4" />
      <TableSkeleton rows={6} />
    </div>
  );
}
