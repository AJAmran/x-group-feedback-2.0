"use client";

import { X, FileText, SlidersHorizontal, Lock } from "lucide-react";
import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { SearchInput } from "@/components/dashboard/search-input";
import { BranchSelect } from "@/components/dashboard/branch-select";
import { useDashboardUser } from "../../dashboard-context";
import { useFilterParams } from "@/hooks/useFilterParams";

interface Branch {
  id?: string;
  code: string;
  name: string;
}

interface FeedbackFiltersProps {
  branches: Branch[];
}

export function FeedbackFilters({ branches }: FeedbackFiltersProps) {
  const searchParams = useSearchParams();
  const { filters, setFilter, clearFilters: clearUrlFilters, hasFilters: urlHasFilters, filterCount: urlFilterCount } = useFilterParams("/dashboard/feedback");
  const [searchInput, setSearchInput] = useState(filters.search);
  const [prevSearch, setPrevSearch] = useState(filters.search);
  const user = useDashboardUser();
  const isManager = user?.role === "BRANCH_MANAGER";
  const scopedBranch = isManager
    ? branches.find((b) => b.id === String(user?.branchId))
    : undefined;

  // Keep the local draft input in sync with URL without an effect
  // (React 19 recommendation: adjust state during render).
  if (prevSearch !== filters.search) {
    setPrevSearch(filters.search);
    setSearchInput(filters.search);
  }

  const handleSearch = useCallback(() => {
    setFilter("search", searchInput);
  }, [setFilter, searchInput]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    clearUrlFilters();
  }, [clearUrlFilters]);

  const activeFilterCount = urlFilterCount;

  return (
    <div className="glass-card rounded-3xl">
      <div className="px-5 py-3.5 border-b border-ios-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={15} className="text-ios-foreground-subtle" />
          <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Filters</span>
          {urlHasFilters && (
            <span className="text-micro font-bold text-ios-primary bg-ios-primary/10 px-2 py-0.5 rounded-full">{activeFilterCount} active</span>
          )}
        </div>
        {urlHasFilters && (
          <Button variant="ghost-red" size="sm" icon={X} onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[180px] flex items-center">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              onEnter={handleSearch}
              placeholder="Search by name, contact, or comments..."
              className="flex-1"
              inputClassName="pr-16"
            />
            <Button 
              variant="primary" 
              size="sm" 
              className="absolute right-1 h-8 px-3 text-[11px]"
              onClick={handleSearch}
            >
              Search
            </Button>
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

          <SelectInput
            value={filters.rating}
            onChange={(e) => setFilter("rating", e.target.value)}
            className="h-10 text-caption min-w-[120px]"
            placeholder="All Ratings"
            options={[
              { value: "EXCELLENT", label: "Excellent" },
              { value: "GOOD", label: "Good" },
              { value: "AVERAGE", label: "Average" },
              { value: "POOR", label: "Poor" },
            ]}
          />

          <div className="flex items-center gap-1.5">
            <TextInput
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilter("dateFrom", e.target.value)}
              className="h-10 text-caption w-[130px]"
            />
            <span className="text-micro text-ios-foreground-faint">—</span>
            <TextInput
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilter("dateTo", e.target.value)}
              className="h-10 text-caption w-[130px]"
            />
          </div>

          <div className="flex-1" />
          <Button
            variant="primary"
            size="sm"
            icon={FileText}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              window.open(`/dashboard/feedback/report?${params.toString()}`, "_blank");
            }}
          >
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
}
