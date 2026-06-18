"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, Calendar, FileText } from "lucide-react";
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

  return (
    <div className="glass-card p-4 rounded-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ios-foreground-faint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") updateFilter("search", search); }}
            placeholder="Search by name, contact, or comments..."
            className="squircle-input w-full pl-10 h-11 text-caption"
          />
        </div>

        <select
          value={branch}
          onChange={(e) => { setBranch(e.target.value); updateFilter("branch", e.target.value); }}
          className="squircle-input h-11 text-caption min-w-[160px]"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b.code} value={b.code}>{b.name}</option>
          ))}
        </select>

        <select
          value={rating}
          onChange={(e) => { setRating(e.target.value); updateFilter("rating", e.target.value); }}
          className="squircle-input h-11 text-caption min-w-[130px]"
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
          className="squircle-input h-11 text-caption min-w-[130px]"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="flagged">Flagged</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); updateFilter("dateFrom", e.target.value); }}
            className="squircle-input h-11 text-caption"
          />
          <span className="text-ios-foreground-subtle">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); updateFilter("dateTo", e.target.value); }}
            className="squircle-input h-11 text-caption"
          />
        </div>

        {(search || branch || rating || status || dateFrom || dateTo) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-caption font-semibold text-ios-foreground-subtle hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}

        <div className="flex-1" />
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            window.open(`/dashboard/feedback/report?${params.toString()}`, "_blank");
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ios-primary text-white text-caption font-bold shadow-md hover:opacity-90 transition-opacity"
        >
          <FileText size={16} />
          Generate Report
        </button>
      </div>
    </div>
  );
}
