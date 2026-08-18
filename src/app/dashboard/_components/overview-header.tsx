"use client";

import { X, CalendarRange, RefreshCw, SlidersHorizontal, Lock, TrendingUp, FilterX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BranchSelect } from "@/components/dashboard/branch-select";
import { useFilterParams } from "@/hooks/useFilterParams";
import { useDashboardUser } from "@/app/dashboard/dashboard-context";
import { cn } from "@/lib/utils";

interface Branch {
  id: string;
  code: string;
  name: string;
}

interface TagProps {
  label: string;
  onClear: () => void;
}

function ActiveTag({ label, onClear }: TagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-xg-primary-soft border border-xg-primary/20 text-micro font-semibold text-[oklch(36%_0.13_274)]">
      {label}
      <button
        type="button"
        onClick={onClear}
        className="w-4 h-4 rounded-full hover:bg-xg-primary/20 flex items-center justify-center transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={10} />
      </button>
    </span>
  );
}

export function OverviewHeader({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const { filters, setFilter, clearFilters, hasFilters } = useFilterParams("/dashboard");
  const user = useDashboardUser();
  const isManager = user?.role === "BRANCH_MANAGER";
  const scopedBranch = isManager ? branches.find((b) => b.id === String(user?.branchId)) : undefined;
  const [refreshing, setRefreshing] = useState(false);

  const selectedBranch = useMemo(
    () => branches.find((b) => b.code === filters.branch),
    [branches, filters.branch],
  );

  function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    window.setTimeout(() => setRefreshing(false), 800);
  }

  const dateActive = Boolean(filters.dateFrom || filters.dateTo);

  return (
    <div className="glass-card overflow-hidden card-lift">
      <div className="px-5 sm:px-6 pt-5 pb-4 flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Left: title + subtitle */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div
            aria-hidden="true"
            className="relative hidden sm:flex w-11 h-11 rounded-2xl items-center justify-center shrink-0 bg-linear-to-br from-xg-primary to-xg-secondary shadow-[0_8px_20px_-8px_oklch(36%_0.13_274/0.7)]"
          >
            <TrendingUp size={20} className="text-white" strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <h1 className="text-display font-bold text-ios-foreground tracking-tight leading-none">
              Executive Overview
            </h1>
            <p className="text-caption text-ios-foreground-faint mt-1.5 flex items-center gap-1.5 min-w-0">
              <SlidersHorizontal size={11} className="shrink-0 text-xg-primary" />
              <span className="truncate">Real-time feedback performance across all branches</span>
            </p>
          </div>
        </div>

        {/* Right: integrated filter toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 h-10 rounded-xl bg-surface-200 border border-ios-border-subtle transition-colors duration-200 focus-within:border-xg-primary/40 focus-within:ring-2 focus-within:ring-xg-primary/15">
            <CalendarRange size={14} className="text-xg-primary shrink-0" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilter("dateFrom", e.target.value)}
              className="bg-transparent border-0 shadow-none text-caption h-full w-[112px] px-1 rounded-md min-h-0 focus:outline-none focus:ring-0"
              aria-label="Date from"
            />
            <span className="text-micro text-ios-foreground-faint shrink-0">to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilter("dateTo", e.target.value)}
              className="bg-transparent border-0 shadow-none text-caption h-full w-[112px] px-1 rounded-md min-h-0 focus:outline-none focus:ring-0"
              aria-label="Date to"
            />
          </div>

          {isManager && scopedBranch ? (
            <span className="inline-flex items-center gap-1.5 pl-2.5 pr-3 h-10 rounded-xl bg-xg-secondary-soft border border-xg-secondary/25 text-caption font-semibold text-ios-foreground">
              <Lock size={13} className="shrink-0 text-xg-secondary" />
              <span className="max-w-[140px] truncate">{scopedBranch.name}</span>
            </span>
          ) : (
            <BranchSelect
              branches={branches}
              value={filters.branch}
              onSelect={(code) => setFilter("branch", code)}
              placeholder="All Branches"
            />
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl border border-ios-border-subtle bg-surface-200 text-ios-foreground-subtle hover:text-ios-foreground hover:bg-surface-300 transition-all duration-200 disabled:opacity-60",
              refreshing && "animate-spin",
            )}
            aria-label="Refresh dashboard data"
          >
            <RefreshCw size={15} strokeWidth={2.2} />
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 h-10 rounded-xl text-caption font-bold text-ios-foreground-subtle hover:text-red-600 hover:bg-red-500/10 transition-colors"
            >
              <FilterX size={14} strokeWidth={2.2} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="px-5 sm:px-6 pb-4 flex flex-wrap items-center gap-2">
          {dateActive && (
            <ActiveTag
              label={`${filters.dateFrom || "Start"} → ${filters.dateTo || "End"}`}
              onClear={() => {
                setFilter("dateFrom", "");
                setFilter("dateTo", "");
              }}
            />
          )}
          {selectedBranch && !isManager && (
            <ActiveTag label={selectedBranch.name} onClear={() => setFilter("branch", "")} />
          )}
        </div>
      )}
    </div>
  );
}