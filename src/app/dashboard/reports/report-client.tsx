"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import {
  Download,
  FileDown,
  Printer,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Star,
  Search,
  Database,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { numberToRating } from "@/lib/utils";

interface BranchReport {
  branchName: string;
  totalFeedback: number;
  averageRating: number;
  positivePercentage: number;
  negativePercentage: number;
  positiveComments: string[];
  negativeComments: string[];
}

interface ReportData {
  totalFeedbacks: number;
  averageRating: number;
  positivePercentage: number;
  thisWeek: number;
  thisMonth: number;
  branchReports: BranchReport[];
  ratingDistribution: Record<string, number>;
  dailyVolume: { date: string; count: number }[];
  generatedAt: string;
}

const RATING_STYLES: Record<string, string> = {
  EXCELLENT:
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  GOOD: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",
  AVERAGE:
    "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  POOR: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
};

interface ReportClientProps {
  data: ReportData;
  dateFrom?: string;
  dateTo?: string;
}

export function ReportClient({ data, dateFrom, dateTo }: ReportClientProps) {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  // Local date state initialised from search params
  const [localFrom, setLocalFrom] = useState(dateFrom || "");
  const [localTo, setLocalTo] = useState(dateTo || "");

  const filteredBranches = data.branchReports.filter((b) =>
    b.branchName.toLowerCase().includes(search.toLowerCase()),
  );

  const applyDateFilter = useCallback(() => {
    const params = new URLSearchParams();
    if (localFrom) params.set("dateFrom", localFrom);
    if (localTo) params.set("dateTo", localTo);
    const qs = params.toString();
    router.push(`/dashboard/reports${qs ? `?${qs}` : ""}`);
  }, [localFrom, localTo, router]);

  const handleExportExcel = () => {
    const rows = filteredBranches.map((b) => ({
      Branch: b.branchName,
      "Total Feedback": b.totalFeedback,
      "Average Rating": b.averageRating.toFixed(1),
      "Positive %": `${b.positivePercentage}%`,
      "Negative %": `${b.negativePercentage}%`,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Branch Report");
    XLSX.writeFile(
      wb,
      `Branch_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`,
    );
  };

  const handleExportCSV = () => {
    const rows = filteredBranches.map((b) => ({
      Branch: b.branchName,
      "Total Feedback": b.totalFeedback,
      "Average Rating": b.averageRating.toFixed(1),
      "Positive %": `${b.positivePercentage}%`,
      "Negative %": `${b.negativePercentage}%`,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Branch_Report_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const handleBackendExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (localFrom) params.set("startDate", localFrom);
      if (localTo) params.set("endDate", localTo);
      const qs = params.toString();

      const link = document.createElement("a");
      link.href = `/api/export/excel${qs ? `?${qs}` : ""}`;
      link.download = `feedbacks_export_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const distTotal = Object.values(data.ratingDistribution).reduce(
    (s, v) => s + v,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={15} className="text-ios-foreground-subtle" />
          <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
            Date Range
          </span>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-caption font-semibold text-ios-foreground-muted">
              From
            </label>
            <input
              type="date"
              value={localFrom}
              onChange={(e) => setLocalFrom(e.target.value)}
              className="squircle-input h-10 px-3"
            />
          </div>
          <div className="space-y-1">
            <label className="text-caption font-semibold text-ios-foreground-muted">
              To
            </label>
            <input
              type="date"
              value={localTo}
              onChange={(e) => setLocalTo(e.target.value)}
              className="squircle-input h-10 px-3"
            />
          </div>
          <button
            onClick={applyDateFilter}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-ios-primary/10 text-ios-primary text-micro font-bold hover:bg-ios-primary/20 transition-colors"
          >
            <RefreshCw size={13} /> Apply
          </button>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => router.push("/dashboard/reports")}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-ios-border-subtle text-ios-foreground-subtle text-micro font-bold hover:bg-ios-border-subtle transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={15} className="text-ios-foreground-subtle" />
          <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
            Rating Distribution
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: "Excellent",
              key: "EXCELLENT",
              color: "bg-emerald-500",
              light: "bg-emerald-500/10",
              text: "text-emerald-600 dark:text-emerald-400",
            },
            {
              label: "Good",
              key: "GOOD",
              color: "bg-sky-500",
              light: "bg-sky-500/10",
              text: "text-sky-600 dark:text-sky-400",
            },
            {
              label: "Average",
              key: "AVERAGE",
              color: "bg-amber-500",
              light: "bg-amber-500/10",
              text: "text-amber-600 dark:text-amber-400",
            },
            {
              label: "Poor",
              key: "POOR",
              color: "bg-orange-500",
              light: "bg-orange-500/10",
              text: "text-orange-600 dark:text-orange-400",
            },
          ].map((r) => {
            const count = data.ratingDistribution[r.key] || 0;
            const pct = distTotal ? Math.round((count / distTotal) * 100) : 0;
            return (
              <div key={r.key} className={`rounded-2xl p-3.5 ${r.light}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                  <span
                    className={`text-micro font-bold uppercase tracking-wider ${r.text}`}
                  >
                    {r.label}
                  </span>
                </div>
                <p className="text-title font-extrabold text-ios-foreground tracking-tight">
                  {count}
                </p>
                <p className="text-caption text-ios-foreground-faint font-medium">
                  {pct}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Branch Report Table */}
      <div className="glass-card rounded-3xl overflow-hidden print:border print:border-gray-300">
        <div className="px-5 py-3.5 border-b border-ios-border-subtle flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <BarChart3 size={15} className="text-ios-foreground-subtle" />
            <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
              Branch Performance
            </span>
            <span className="text-micro font-medium text-ios-foreground-faint bg-ios-border-subtle/50 px-2 py-0.5 rounded-full">
              {filteredBranches.length} branches
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ios-foreground-faint"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter branches..."
                className="squircle-input h-8 text-caption pl-8 w-40 py-0"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ios-primary/10 text-ios-primary text-micro font-bold hover:bg-ios-primary/20 transition-colors"
            >
              <FileDown size={13} /> CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-micro font-bold hover:bg-emerald-500/20 transition-colors"
            >
              <Download size={13} /> Excel
            </button>
            <button
              onClick={handleBackendExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ios-primary/10 text-ios-primary text-micro font-bold hover:bg-ios-primary/20 transition-colors disabled:opacity-50"
            >
              <Database size={13} />{" "}
              {exporting ? "Exporting..." : "Export (Server)"}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ios-primary/10 text-ios-primary text-micro font-bold hover:bg-ios-primary/20 transition-colors"
            >
              <Printer size={13} /> Print
            </button>
          </div>
        </div>

        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-ios-border-subtle">
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
                  Branch
                </th>
                <th className="text-center px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
                  Feedback
                </th>
                <th className="text-center px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
                  Avg Rating
                </th>
                <th className="text-center px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
                  Positive
                </th>
                <th className="text-center px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
                  Negative
                </th>
                <th className="text-center px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
                  Bar
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-caption text-ios-foreground-faint"
                  >
                    {search
                      ? "No branches match your search"
                      : "No feedback data available"}
                  </td>
                </tr>
              ) : (
                filteredBranches.map((b) => {
                  const ratingLabel = numberToRating(
                    Math.round(b.averageRating),
                  ) ?? "AVERAGE";
                  return (
                    <tr
                      key={b.branchName}
                      className="border-b border-ios-border-subtle last:border-0 hover:bg-ios-border-subtle/50 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-label font-semibold text-ios-foreground">
                          {b.branchName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-label font-bold text-ios-foreground">
                          {b.totalFeedback}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-micro font-bold uppercase tracking-wider border ${
                            RATING_STYLES[ratingLabel] ||
                            "bg-ios-border-subtle text-ios-foreground-subtle"
                          }`}
                        >
                          <Star size={10} className="fill-current mr-1" />
                          {b.averageRating.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-micro font-bold text-emerald-600 dark:text-emerald-400">
                          <ThumbsUp size={12} /> {b.positivePercentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-micro font-bold text-red-600 dark:text-red-400">
                          <ThumbsDown size={12} /> {b.negativePercentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 h-4">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${b.positivePercentage}%` }}
                          />
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{ width: `${b.negativePercentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-2.5 border-t border-ios-border-subtle flex items-center justify-between text-caption text-ios-foreground-faint print:hidden">
          <span>
            Generated{" "}
            {format(new Date(data.generatedAt), "MMM d, yyyy h:mm a")}
          </span>
          <span>
            {data.totalFeedbacks} total feedbacks across{" "}
            {data.branchReports.length} branches
          </span>
        </div>
      </div>
    </div>
  );
}
