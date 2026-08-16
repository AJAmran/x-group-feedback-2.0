import { Suspense } from "react";
import { BadgePercent } from "lucide-react";
import { GuestOffersClient } from "./_components/guest-offers-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatsGridSkeleton, ToolbarSkeleton, TableCardSkeleton } from "../../_components/skeleton";
import {
  getDiscountLogs,
  getEntertainmentLogs,
  getGuestOfferSummary,
} from "@/features/guest-offer/actions";
import { getBranchList } from "@/features/dashboard/actions";

async function GuestOffersContent() {
  // Initial data is fetched server-side in a single request scope, so the
  // shared /auth/me lookup runs once (React cache dedupes) and every backend
  // call runs in parallel — the page streams with data instead of firing five
  // sequential server actions after hydration.
  const [discounts, entertainments, summary, pendingDiscounts, pendingEntertainments, branches] =
    await Promise.all([
      getDiscountLogs({ page: 1, limit: 25 }),
      getEntertainmentLogs({ page: 1, limit: 25 }),
      getGuestOfferSummary({}),
      getDiscountLogs({ page: 1, limit: 1, approvalStatus: "PENDING" }),
      getEntertainmentLogs({ page: 1, limit: 1, approvalStatus: "PENDING" }),
      getBranchList(),
    ]);

  return (
    <GuestOffersClient
      initialDiscounts={discounts}
      initialEntertainments={entertainments}
      initialSummary={summary}
      initialPending={{
        discounts: pendingDiscounts.total,
        entertainments: pendingEntertainments.total,
      }}
      branches={branches}
    />
  );
}

export default function GuestOffersPage() {
  return (
    <div className="space-y-5 pb-8">
      <PageHeader
        icon={BadgePercent}
        title="Guest Discount & Entertainment"
        subtitle="অতিথি ডিসকাউন্ট ও এন্টারটেইনমেন্ট"
        description="Daily guest discount and entertainment offers with admin approval"
      />

      <Suspense
        fallback={
          <div className="space-y-5">
            <StatsGridSkeleton count={3} cols="sm:grid-cols-3" />
            <ToolbarSkeleton inputs={1} actions={1} />
            <TableCardSkeleton rows={6} columns={8} />
          </div>
        }
      >
        <GuestOffersContent />
      </Suspense>
    </div>
  );
}
