"use client";

import { Lock } from "lucide-react";
import { BranchSelect } from "@/components/dashboard/branch-select";
import { FilterBarShell } from "@/components/dashboard/filter-bar-shell";
import { DateRangeFilter } from "@/components/dashboard/filters";
import { useFilterParams } from "@/hooks/useFilterParams";
import { useDashboardUser } from "@/app/dashboard/dashboard-context";

interface Branch {
  id: string;
  code: string;
  name: string;
}

interface DashboardFilterBarProps {
  branches: Branch[];
  basePath: string;
}

export function DashboardFilterBar({ branches, basePath }: DashboardFilterBarProps) {
  const { filters, setFilter, clearFilters, hasFilters, filterCount } = useFilterParams(basePath);
  const user = useDashboardUser();
  const isManager = user?.role === "BRANCH_MANAGER";
  // For branch managers the backend scopes every query to their own branch.
  const scopedBranch = isManager
    ? branches.find((b) => b.id === String(user?.branchId))
    : undefined;

  return (
    <FilterBarShell activeCount={filterCount} onClearAll={hasFilters ? clearFilters : undefined}>
      <div className="flex flex-wrap items-center gap-3">
        <DateRangeFilter
          start={filters.dateFrom}
          end={filters.dateTo}
          onStartChange={(value) => setFilter("dateFrom", value)}
          onEndChange={(value) => setFilter("dateTo", value)}
        />

        {isManager && scopedBranch ? (
          <span className="inline-flex items-center gap-1.5 pl-2.5 pr-3 h-10 rounded-xl bg-ios-primary/8 border border-ios-primary/15 text-caption font-semibold text-ios-primary">
            <Lock size={13} className="shrink-0" />
            {scopedBranch.name}
            <span className="text-micro font-medium text-ios-foreground-faint">(scoped to your branch)</span>
          </span>
        ) : (
          <BranchSelect
            branches={branches}
            value={filters.branch}
            onSelect={(code) => setFilter("branch", code)}
            placeholder="All Branches"
          />
        )}
      </div>
    </FilterBarShell>
  );
}
