import { Suspense } from "react";
import { PackageCheck } from "lucide-react";
import { InventoryClient } from "./_components/inventory-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { ToolbarSkeleton, TableCardSkeleton } from "../../_components/skeleton";

export default function InventoryPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        icon={PackageCheck}
        title="Monthly Inventory"
        description="Monthly inventory statements for convention centers and restaurants"
      />

      <Suspense
        fallback={
          <div className="space-y-5">
            <ToolbarSkeleton inputs={2} actions={1} />
            <TableCardSkeleton rows={6} columns={5} />
          </div>
        }
      >
        <InventoryClient />
      </Suspense>
    </div>
  );
}
