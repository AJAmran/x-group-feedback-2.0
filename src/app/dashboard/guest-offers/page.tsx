import { Suspense } from "react";
import { BadgePercent } from "lucide-react";
import { GuestOffersClient } from "./_components/guest-offers-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableSkeleton } from "../../_components/skeleton";

export default function GuestOffersPage() {
  return (
    <div className="space-y-5 pb-8">
      <PageHeader
        icon={BadgePercent}
        title="Guest Discount & Entertainment"
        subtitle="অতিথি ডিসকাউন্ট ও এন্টারটেইনমেন্ট"
        description="Daily guest discount and entertainment offers with admin approval"
      />

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <GuestOffersClient />
      </Suspense>
    </div>
  );
}
