"use client";

import { Search, X, FileText, SlidersHorizontal } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useFilterParams } from "@/hooks/useFilterParams";

interface Branch {
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleSearch = useCallback(() => {
    setFilter("search", searchInput);
  }, [setFilter, searchInput]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  }, [handleSearch]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    clearUrlFilters();
  }, [clearUrlFilters]);

  const hasFilters = urlHasFilters || searchInput !== filters.search;
  const activeFilterCount = urlFilterCount + (filters.search ? 1 : 0);

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
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-foreground-faint" />
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by name, contact, or comments..."
              className="squircle-input w-full pl-9 pr-16 h-10 text-caption"
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

          <select
            value={filters.branch}
            onChange={(e) => setFilter("branch", e.target.value)}
            className="squircle-input h-10 text-caption min-w-[140px]"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>

          <select
            value={filters.rating}
            onChange={(e) => setFilter("rating", e.target.value)}
            className="squircle-input h-10 text-caption min-w-[120px]"
          >
            <option value="">All Ratings</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="AVERAGE">Average</option>
            <option value="POOR">Poor</option>
          </select>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilter("dateFrom", e.target.value)}
              className="squircle-input h-10 text-caption w-[130px]"
            />
            <span className="text-micro text-ios-foreground-faint">—</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilter("dateTo", e.target.value)}
              className="squircle-input h-10 text-caption w-[130px]"
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
