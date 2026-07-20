"use client";

import { X, SlidersHorizontal, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useFilterParams } from "@/hooks/useFilterParams";

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

  return (
    <div className="glass-card rounded-3xl">
      <div className="px-5 py-3.5 border-b border-ios-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={15} className="text-ios-foreground-subtle" />
          <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Filters</span>
          {hasFilters && (
            <span className="text-micro font-bold text-ios-primary bg-ios-primary/10 px-2 py-0.5 rounded-full">{filterCount} active</span>
          )}
        </div>
        {hasFilters && (
          <Button variant="ghost-red" size="sm" icon={X} onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-ios-foreground-faint shrink-0" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilter("dateFrom", e.target.value)}
              className="squircle-input h-10 text-caption w-[140px]"
            />
            <span className="text-micro text-ios-foreground-faint">—</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilter("dateTo", e.target.value)}
              className="squircle-input h-10 text-caption w-[140px]"
            />
          </div>

          <div className="w-px h-8 bg-ios-border-subtle" />

          <select
            value={filters.branch}
            onChange={(e) => setFilter("branch", e.target.value)}
            className="squircle-input h-10 text-caption min-w-[160px]"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
