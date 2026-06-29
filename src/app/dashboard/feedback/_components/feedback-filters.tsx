"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, FileText, SlidersHorizontal } from "lucide-react";
import { useState, useCallback } from "react";

interface Branch {
  code: string;
  name: string;
}

interface FeedbackFiltersProps {
  branches: Branch[];
}

export function FeedbackFilters({ branches }: FeedbackFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [branch, setBranch] = useState(searchParams.get("branch") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/dashboard/feedback?${params.toString()}`);
  }, [router, searchParams]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setBranch("");
    setRating("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    router.push("/dashboard/feedback");
  }, [router]);

  const hasFilters = search || branch || rating || status || dateFrom || dateTo;
  const filterCount = [search, branch, rating, status, dateFrom, dateTo].filter(Boolean).length;

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
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-micro font-semibold text-ios-foreground-subtle hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-foreground-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") updateFilter("search", search); }}
              placeholder="Search by name, contact, or comments..."
              className="squircle-input w-full pl-9 h-10 text-caption"
            />
          </div>

          <select
            value={branch}
            onChange={(e) => { setBranch(e.target.value); updateFilter("branch", e.target.value); }}
            className="squircle-input h-10 text-caption min-w-[140px]"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>

          <select
            value={rating}
            onChange={(e) => { setRating(e.target.value); updateFilter("rating", e.target.value); }}
            className="squircle-input h-10 text-caption min-w-[120px]"
          >
            <option value="">All Ratings</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="AVERAGE">Average</option>
            <option value="POOR">Poor</option>
            <option value="VERY_POOR">Very Poor</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); updateFilter("status", e.target.value); }}
            className="squircle-input h-10 text-caption min-w-[120px]"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="flagged">Flagged</option>
          </select>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); updateFilter("dateFrom", e.target.value); }}
              className="squircle-input h-10 text-caption w-[130px]"
            />
            <span className="text-micro text-ios-foreground-faint">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); updateFilter("dateTo", e.target.value); }}
              className="squircle-input h-10 text-caption w-[130px]"
            />
          </div>

          <div className="flex-1" />
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              window.open(`/dashboard/feedback/report?${params.toString()}`, "_blank");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ios-primary text-white text-caption font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            <FileText size={14} />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
