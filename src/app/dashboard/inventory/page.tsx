import { Suspense } from "react";
import { PackageCheck } from "lucide-react";
import { InventoryClient } from "./_components/inventory-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableSkeleton } from "../../_components/skeleton";

export default function InventoryPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        icon={PackageCheck}
        title="Monthly Inventory"
        description="Monthly inventory statements for convention centers and restaurants"
      />

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <InventoryClient />
      </Suspense>
    </div>
  );
}
