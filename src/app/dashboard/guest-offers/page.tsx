import { Suspense } from "react";
import { GuestOffersClient } from "./_components/guest-offers-client";
import { TableSkeleton } from "../../_components/skeleton";

export default function GuestOffersPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Guest Discount & Entertainment</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">
          Daily guest discount and entertainment offers with admin approval
        </p>
      </div>

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <GuestOffersClient />
      </Suspense>
    </div>
  );
}
