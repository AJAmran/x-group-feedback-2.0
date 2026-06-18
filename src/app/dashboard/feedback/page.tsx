import { Suspense } from "react";
import { getFeedbackList, getBranchList } from "@/features/dashboard/actions";
import { FeedbackTable } from "./_components/feedback-table";
import { FeedbackFilters } from "./_components/feedback-filters";

async function FeedbackContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const [data, branches] = await Promise.all([
    getFeedbackList({
      page: Number(params.page) || 1,
      pageSize: 20,
      branchCode: params.branch,
      rating: params.rating,
      status: params.status,
      search: params.search,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    }),
    getBranchList(),
  ]);

  return (
    <>
      <FeedbackFilters branches={branches} />
      <FeedbackTable data={data} />
    </>
  );
}

export default function FeedbackPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Feedback Management</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">Review and manage guest feedback across all branches</p>
      </div>

      <Suspense fallback={
        <div className="glass-card p-6 rounded-[1.5rem] animate-pulse space-y-4">
          <div className="h-10 w-full bg-ios-border-subtle rounded-xl" />
          <div className="h-64 w-full bg-ios-border-subtle rounded-xl" />
        </div>
      }>
        <FeedbackContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
