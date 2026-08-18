"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Download,
  FileDown,
  Printer,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Star,
  Database,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { SearchInput } from "@/components/dashboard/search-input";
import { Table, THead, THeadRow, TH, TD, TR, TableEmpty } from "@/components/dashboard/table";
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
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const [localFrom, setLocalFrom] = useState(dateFrom || "");
  const [localTo, setLocalTo] = useState(dateTo || "");

  const filteredBranches = useMemo(() =>
    data.branchReports.filter((b) =>
      b.branchName.toLowerCase().includes(search.toLowerCase()),
    ), [data.branchReports, search],
  );

  const applyDateFilter = useCallback(() => {
    const params = new URLSearchParams();
    if (localFrom) params.set("dateFrom", localFrom);
    if (localTo) params.set("dateTo", localTo);
    const qs = params.toString();
    router.push(`/dashboard/reports${qs ? `?${qs}` : ""}`);
  }, [localFrom, localTo, router]);

  const handleExportExcel = useCallback(async () => {
    const XLSX = await import("xlsx");
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
  }, [filteredBranches]);

  const handleExportCSV = useCallback(async () => {
    const XLSX = await import("xlsx");
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
  }, [filteredBranches]);

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

  const distTotal = useMemo(() => Object.values(data.ratingDistribution).reduce(
    (s, v) => s + v,
    0,
  ), [data.ratingDistribution]);

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="glass-card p-5">
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
            <TextInput
              type="date"
              value={localFrom}
              onChange={(e) => setLocalFrom(e.target.value)}
              className="h-10 !min-h-0 !py-0 px-3"
            />
          </div>
          <div className="space-y-1">
            <label className="text-caption font-semibold text-ios-foreground-muted">
              To
            </label>
            <TextInput
              type="date"
              value={localTo}
              onChange={(e) => setLocalTo(e.target.value)}
              className="h-10 !min-h-0 !py-0 px-3"
            />
          </div>
          <Button variant="ghost" size="md" icon={RefreshCw} className="h-10" onClick={applyDateFilter}>
            Apply
          </Button>
          {(dateFrom || dateTo) && (
            <Button variant="outline" size="md" onClick={() => router.push("/dashboard/reports")}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={15} className="text-ios-foreground-subtle" />
          <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
            Rating Distribution
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
                <p className="stat-value">
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
      <div className="glass-card overflow-hidden print:border print:border-gray-300">
        <div className="px-5 py-3.5 border-b border-ios-border-subtle flex items-center justify-between gap-3 flex-wrap print:hidden">
          <div className="flex items-center gap-2.5">
            <BarChart3 size={15} className="text-ios-foreground-subtle" />
            <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
              Branch Performance
            </span>
            <span className="text-micro font-medium text-ios-foreground-faint bg-ios-border-subtle/50 px-2 py-0.5 rounded-full">
              {filteredBranches.length} branches
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Filter branches..."
              className="w-40"
            />
            <Button variant="ghost" size="sm" icon={FileDown} onClick={handleExportCSV}>
              CSV
            </Button>
            <Button variant="ghost-green" size="sm" icon={Download} onClick={handleExportExcel}>
              Excel
            </Button>
            <Button variant="ghost" size="sm" icon={Database} loading={exporting} onClick={handleBackendExport}>
              Export (Server)
            </Button>
            <Button variant="ghost" size="sm" icon={Printer} onClick={handlePrint}>
              Print
            </Button>
          </div>
        </div>

        <Table>
          <THead>
              <THeadRow>
                <TH>Branch</TH>
                <TH align="center">Feedback</TH>
                <TH align="center">Avg Rating</TH>
                <TH align="center">Positive</TH>
                <TH align="center">Negative</TH>
                <TH align="center">Bar</TH>
              </THeadRow>
            </THead>
            <tbody>
              {filteredBranches.length === 0 ? (
                <TableEmpty
                  colSpan={6}
                  icon={BarChart3}
                  title={search ? "No branches match your search" : "No feedback data available"}
                />
              ) : (
                filteredBranches.map((b) => {
                  const ratingLabel = numberToRating(
                    Math.round(b.averageRating),
                  ) ?? "AVERAGE";
                  return (
                    <TR key={b.branchName}>
                      <TD>
                        <span className="text-label font-semibold text-ios-foreground">
                          {b.branchName}
                        </span>
                      </TD>
                      <TD align="center">
                        <span className="text-label font-bold text-ios-foreground">
                          {b.totalFeedback}
                        </span>
                      </TD>
                      <TD align="center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-micro font-bold uppercase tracking-wider border ${
                            RATING_STYLES[ratingLabel] ||
                            "bg-ios-border-subtle text-ios-foreground-subtle"
                          }`}
                        >
                          <Star size={10} className="fill-current mr-1" />
                          {b.averageRating.toFixed(1)}
                        </span>
                      </TD>
                      <TD align="center">
                        <span className="inline-flex items-center gap-1 text-micro font-bold text-emerald-600 dark:text-emerald-400">
                          <ThumbsUp size={12} /> {b.positivePercentage}%
                        </span>
                      </TD>
                      <TD align="center">
                        <span className="inline-flex items-center gap-1 text-micro font-bold text-red-600 dark:text-red-400">
                          <ThumbsDown size={12} /> {b.negativePercentage}%
                        </span>
                      </TD>
                      <TD align="center">
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
                      </TD>
                    </TR>
                  );
                })
              )}
            </tbody>
          </Table>

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
