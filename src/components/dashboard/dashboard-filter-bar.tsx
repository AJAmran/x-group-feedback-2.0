"use client";

import { X, SlidersHorizontal, CalendarRange, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BranchSelect } from "@/components/dashboard/branch-select";
import { useFilterParams } from "@/hooks/useFilterParams";
import { useDashboardUser } from "@/app/dashboard/dashboard-context";

interface Branch {
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
  const scopedBranch = isManager ? branches[0] : undefined;

  return (
    <div className="rounded-2xl border border-ios-border-subtle bg-surface-300 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-ios-border-subtle">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-ios-primary/[0.07] border border-ios-primary/10 flex items-center justify-center shrink-0">
            <SlidersHorizontal size={15} className="text-ios-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-label font-bold text-ios-foreground leading-none">Filters</p>
            <p className="text-micro text-ios-foreground-faint mt-1">Refine the metrics below</p>
          </div>
          {hasFilters && (
            <span className="text-micro font-bold text-ios-primary bg-ios-primary/10 px-2 py-0.5 rounded-full border border-ios-primary/15 shrink-0">
              {filterCount} active
            </span>
          )}
        </div>
        {hasFilters && (
          <Button variant="ghost-red" size="sm" icon={X} onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      <div className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-200 border border-ios-border-subtle transition-colors duration-200 focus-within:border-ios-primary/40 focus-within:ring-2 focus-within:ring-ios-primary/10">
            <CalendarRange size={14} className="text-ios-foreground-subtle shrink-0" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilter("dateFrom", e.target.value)}
              className="bg-transparent border-0 shadow-none text-caption h-8 w-[128px] px-1.5 rounded-md min-h-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
              aria-label="Date from"
            />
            <span className="text-micro text-ios-foreground-faint shrink-0">to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilter("dateTo", e.target.value)}
              className="bg-transparent border-0 shadow-none text-caption h-8 w-[128px] px-1.5 rounded-md min-h-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
              aria-label="Date to"
            />
          </div>

          {isManager && scopedBranch ? (
            <span className="inline-flex items-center gap-1.5 pl-2.5 pr-3 py-2 rounded-xl bg-ios-primary/8 border border-ios-primary/15 text-caption font-semibold text-ios-primary">
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
      </div>
    </div>
  );
}