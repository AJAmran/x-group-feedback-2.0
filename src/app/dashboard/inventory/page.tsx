import { Suspense } from "react";
import { InventoryClient } from "./_components/inventory-client";
import { TableSkeleton } from "../../_components/skeleton";

export default function InventoryPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Convention Monthly Inventory</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">
          Monthly inventory statements for convention centers and restaurants
        </p>
      </div>

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <InventoryClient />
      </Suspense>
    </div>
  );
}
