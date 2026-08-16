"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Download,
  FileText,
  Printer,
  Building2,
  Inbox,
  FileCheck2,
  Lock,
  AlertTriangle,
  PackageCheck,
  ClipboardCheck,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Modal } from "@/components/ui/Modal";
import { Table, THead, THeadRow, TH, TD, TR, TableEmpty, TableSkeletonRows } from "@/components/dashboard/table";
import { CardHeader } from "@/components/dashboard/card-header";
import { StatusBadge as StatusBadgeShared } from "@/components/dashboard/status-badge";
import { OpsStatCard } from "@/components/dashboard/ops-stat-card";
import { StatsGridSkeleton } from "@/app/_components/skeleton";
import { useDashboardUser } from "../../../dashboard-context";
import { isAdminRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { getBranchList } from "@/features/dashboard/actions";
import { getInventoryReportAction, getInventoryBranchDetail } from "@/features/inventory/actions";
import type {
  InventoryReport,
  InventoryReportStatus,
  InventoryReportTotals,
  InventoryReportBranchRow,
  InventoryBranchDetail,
  InventoryLine,
} from "@/features/inventory/actions";

const STATUS_VARIANT: Record<InventoryReportStatus, "warning" | "info" | "success" | "danger"> = {
  DRAFT: "warning",
  SUBMITTED: "info",
  LOCKED: "success",
  MISSING: "danger",
};

const STATUS_LABEL: Record<InventoryReportStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  LOCKED: "Locked",
  MISSING: "Missing",
};

function StatusBadge({ status }: { status: InventoryReportStatus }) {
  return (
    <StatusBadgeShared variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</StatusBadgeShared>
  );
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function formatMonth(month: string): string {
  return format(new Date(`${month}-01T00:00:00`), "MMMM yyyy");
}

function zeroTotals(): InventoryReportTotals {
  return { openingStock: 0, added: 0, brokenLost: 0, reject: 0, closingStock: 0 };
}

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

export function InventoryReportView() {
  const user = useDashboardUser();
  const isAdmin = isAdminRole(user.role);

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [branchId, setBranchId] = useState("");
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const [detailRow, setDetailRow] = useState<InventoryReportBranchRow | null>(null);

  useEffect(() => {
    if (isAdmin) void getBranchList().then(setBranches);
  }, [isAdmin]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const data = await getInventoryReportAction({
      statementMonth: month || undefined,
      branchId: branchId || undefined,
    });
    setReport(data);
    setLoading(false);
    if (!data) setError("Failed to load the inventory report. Please try again.");
  }, [month, branchId]);

  useEffect(() => {
    void load();
  }, [load]);

  const grandTotals = (report?.branches ?? []).reduce<InventoryReportTotals>((acc, row) => {
    acc.openingStock += row.totals.openingStock;
    acc.added += row.totals.added;
    acc.brokenLost += row.totals.brokenLost;
    acc.reject += row.totals.reject;
    acc.closingStock += row.totals.closingStock;
    return acc;
  }, zeroTotals());

  const handleExportExcel = async () => {
    if (!report || exporting) return;
    setExporting("excel");
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("statementMonth", report.month);
      if (branchId) params.set("branchId", branchId);
      const res = await fetch(`/api/export/excel/inventory?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory_report_${report.month}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Excel export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    if (!report || exporting) return;
    setExporting("pdf");
    setError("");
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFontSize(16);
      doc.text("Inventory Report", 14, 15);
      doc.setFontSize(10);
      doc.text(formatMonth(report.month), 14, 22);

      autoTable(doc, {
        head: [["Branch", "Status", "Items", "Opening", "Added", "Broken / Lost", "Reject", "Closing", "Submitted At", "Submitted By"]],
        body: report.branches.map((r) => [
          r.branch.code ? `${r.branch.code} — ${r.branch.name}` : r.branch.name,
          STATUS_LABEL[r.status],
          String(r.lineCount),
          String(r.totals.openingStock),
          String(r.totals.added),
          String(r.totals.brokenLost),
          String(r.totals.reject),
          String(r.totals.closingStock),
          r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—",
          r.submittedBy?.name ?? "—",
        ]),
        startY: 28,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 98, 255] },
      });

      if (report.categoryTotals.length > 0) {
        const finalY =
          (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 28;
        const catStart = finalY + 12;
        doc.setFontSize(12);
        doc.text("Category Totals", 14, catStart);
        autoTable(doc, {
          head: [["Category", "Opening", "Added", "Broken / Lost", "Reject", "Closing"]],
          body: report.categoryTotals.map((c) => [
            c.name,
            String(c.totals.openingStock),
            String(c.totals.added),
            String(c.totals.brokenLost),
            String(c.totals.reject),
            String(c.totals.closingStock),
          ]),
          startY: catStart + 4,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 98, 255] },
        });
      }

      doc.save(`Inventory_Report_${report.month}.pdf`);
    } catch {
      setError("PDF export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const summary = report?.summary;
  const hasBranches = (report?.branches.length ?? 0) > 0;

  return (
    <>
      <div className="rounded-2xl border border-ios-border-subtle bg-surface-300 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-ios-border-subtle flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-ios-primary/9 border border-ios-primary/10 text-ios-primary flex items-center justify-center shrink-0">
              <ClipboardCheck size={15} strokeWidth={2} />
            </div>
            <h2 className="text-label font-bold text-ios-foreground">Report Filters</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TextInput
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-auto"
              aria-label="Statement month"
            />
            {isAdmin && (
              <SelectInput
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                placeholder="All branches"
                options={branches.map((b) => ({ value: b.id, label: `${b.code} — ${b.name}` }))}
                className="w-auto min-w-[200px]"
              />
            )}
            <div className="flex gap-2">
              <Button
                variant="ghost-green"
                size="sm"
                icon={Download}
                loading={exporting === "excel"}
                disabled={exporting != null || !hasBranches}
                onClick={() => void handleExportExcel()}
              >
                Excel
              </Button>
              <Button
                variant="ghost-danger"
                size="sm"
                icon={FileText}
                loading={exporting === "pdf"}
                disabled={exporting != null || !hasBranches}
                onClick={() => void handleExportPDF()}
              >
                PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Printer}
                disabled={exporting != null}
                onClick={() => window.print()}
              >
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <ErrorMessage>
          <span className="block">{error}</span>
          <span className="block mt-1">
            <Button variant="ghost" size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </span>
        </ErrorMessage>
      )}

      {loading ? (
        <StatsGridSkeleton count={5} cols="lg:grid-cols-5" />
      ) : summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <OpsStatCard icon={Inbox} label="মোট শাখা" value={summary.totalBranches} subtext="Total branches" />
          <OpsStatCard icon={PackageCheck} label="স্টেটমেন্ট জমা" value={summary.branchesWithStatement} subtext="Statements submitted" />
          <OpsStatCard icon={FileCheck2} label="জমা দেওয়া হয়েছে" value={summary.submitted} tone="green" subtext="Submitted / Locked" />
          <OpsStatCard icon={Lock} label="লক করা হয়েছে" value={summary.locked} tone="gold" subtext="Locked statements" />
          <OpsStatCard icon={AlertTriangle} label="জমা দেওয়া হয়নি" value={summary.missing} tone="red" subtext="Branches without statement" />
        </div>
      )}

      <div className="glass-card rounded-3xl overflow-hidden">
        <CardHeader icon={Building2} title="By Branch" count={summary?.totalBranches} />

        <Table>
          <THead>
            <THeadRow>
              <TH>Branch</TH>
              <TH>Status</TH>
              <TH align="right">Items</TH>
              <TH align="right">Opening</TH>
              <TH align="right">Added</TH>
              <TH align="right">Broken / Lost</TH>
              <TH align="right">Reject</TH>
              <TH align="right">Closing</TH>
              <TH align="right">Actions</TH>
            </THeadRow>
          </THead>
          <tbody>
            {loading ? (
              <TableSkeletonRows colSpan={9} rows={6} />
            ) : !report ? (
              <TableEmpty colSpan={9} icon={Building2} title="No report data" />
            ) : report.branches.length === 0 ? (
              <TableEmpty colSpan={9} icon={Building2} title="No branches found" />
            ) : (
              report.branches.map((row) => (
                <TR key={row.branch.id}>
                  <TD>
                    <span className="text-label font-semibold text-ios-foreground whitespace-nowrap">
                      {row.branch.code ? `${row.branch.code} — ${row.branch.name}` : row.branch.name}
                    </span>
                  </TD>
                  <TD>
                    <StatusBadge status={row.status} />
                  </TD>
                  <TD align="right">
                    <span className="text-caption font-semibold text-ios-foreground-muted tabular-nums">{row.lineCount}</span>
                  </TD>
                  <TD align="right">
                    <span className="text-caption font-semibold text-ios-foreground-muted tabular-nums">{row.totals.openingStock}</span>
                  </TD>
                  <TD align="right">
                    <span className="text-caption font-semibold text-ios-foreground tabular-nums">{row.totals.added}</span>
                  </TD>
                  <TD align="right">
                    <span className="text-caption font-semibold text-ios-foreground-muted tabular-nums">{row.totals.brokenLost}</span>
                  </TD>
                  <TD align="right">
                    <span className="text-caption font-semibold text-ios-foreground-muted tabular-nums">{row.totals.reject}</span>
                  </TD>
                  <TD align="right">
                    <span className="text-caption font-bold text-ios-primary tabular-nums">{row.totals.closingStock}</span>
                  </TD>
                  <TD align="right">
                    <button
                      type="button"
                      onClick={() => setDetailRow(row)}
                      aria-label={`View details for ${row.branch.name}`}
                      title="View branch details"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-ios-foreground-subtle hover:bg-ios-border-subtle hover:text-ios-primary transition-colors"
                    >
                      <Eye size={15} />
                    </button>
                  </TD>
                </TR>
              ))
            )}
          </tbody>
          {!loading && report && report.branches.length > 0 && (
            <tfoot>
              <tr className="border-t border-ios-border-subtle bg-ios-border-subtle/20">
                <TD className="text-caption font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
                  মোট / Total
                </TD>
                <TD>
                  <span className="text-caption font-semibold text-ios-foreground-subtle">
                    {report.summary.branchesWithStatement} statement(s)
                  </span>
                </TD>
                <TD align="right" />
                <TD align="right">
                  <span className="text-caption font-bold text-ios-foreground tabular-nums">{grandTotals.openingStock}</span>
                </TD>
                <TD align="right">
                  <span className="text-caption font-bold text-ios-foreground tabular-nums">{grandTotals.added}</span>
                </TD>
                <TD align="right">
                  <span className="text-caption font-bold text-ios-foreground tabular-nums">{grandTotals.brokenLost}</span>
                </TD>
                <TD align="right">
                  <span className="text-caption font-bold text-ios-foreground tabular-nums">{grandTotals.reject}</span>
                </TD>
                <TD align="right">
                  <span className="text-caption font-extrabold text-ios-primary tabular-nums">{grandTotals.closingStock}</span>
                </TD>
                <TD />
              </tr>
            </tfoot>
          )}
        </Table>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <CardHeader icon={PackageCheck} title="Category Totals" count={report?.categoryTotals.length} />

        <Table>
          <THead>
            <THeadRow>
              <TH>Category</TH>
              <TH align="right">Opening</TH>
              <TH align="right">Added</TH>
              <TH align="right">Broken / Lost</TH>
              <TH align="right">Reject</TH>
              <TH align="right">Closing</TH>
            </THeadRow>
          </THead>
          <tbody>
            {loading ? (
              <TableSkeletonRows colSpan={6} rows={4} />
            ) : !report || report.categoryTotals.length === 0 ? (
              <TableEmpty colSpan={6} icon={PackageCheck} title="No category totals" />
            ) : (
              report.categoryTotals.map((cat) => (
                <TR key={cat.id}>
                  <TD>
                    <span className="text-label font-semibold text-ios-foreground">{cat.name}</span>
                  </TD>
                  <TD align="right">
                    <span className="text-caption font-semibold text-ios-foreground-muted tabular-nums">{cat.totals.openingStock}</span>
                  </TD>
                  <TD align="right">
                    <span className="text-caption font-semibold text-ios-foreground tabular-nums">{cat.totals.added}</span>
                  </TD>
                  <TD align="right">
                    <span className="text-caption font-semibold text-ios-foreground-muted tabular-nums">{cat.totals.brokenLost}</span>
                  </TD>
                  <TD align="right">
                    <span className="text-caption font-semibold text-ios-foreground-muted tabular-nums">{cat.totals.reject}</span>
                  </TD>
                  <TD align="right">
                    <span className="text-caption font-bold text-ios-primary tabular-nums">{cat.totals.closingStock}</span>
                  </TD>
                </TR>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {detailRow && (
        <BranchDetailModal row={detailRow} month={month} onClose={() => setDetailRow(null)} />
      )}
    </>
  );
}

function sumLines(lines: InventoryLine[], into: InventoryReportTotals = zeroTotals()): InventoryReportTotals {
  for (const line of lines) {
    into.openingStock += line.openingStock;
    into.added += line.added;
    into.brokenLost += line.brokenLost;
    into.reject += line.reject;
    into.closingStock += line.closingStock;
  }
  return into;
}

function TotalsCell({ value, strong }: { value: number; strong?: boolean }) {
  return (
    <span className={cn("tabular-nums", strong ? "text-caption font-bold text-ios-foreground" : "text-caption font-semibold text-ios-foreground-muted")}>
      {value}
    </span>
  );
}

/**
 * Per-branch detail modal: shows the branch's statement line items grouped by
 * category, with per-category subtotals and a grand total.
 */
function BranchDetailModal({
  row,
  month,
  onClose,
}: {
  row: InventoryReportBranchRow;
  month: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<InventoryBranchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");
    setDetail(null);
    getInventoryBranchDetail(row.branch.id, month)
      .then((d) => {
        if (!active) return;
        setDetail(d);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load branch details. Please try again.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [row.branch.id, month]);

  const groups = useMemo(() => {
    if (!detail) return [];
    const byCat = new Map<string, InventoryLine[]>();
    for (const line of detail.lines) {
      const name = line.item.category?.name || "Other";
      const items = byCat.get(name) ?? [];
      items.push(line);
      byCat.set(name, items);
    }
    return [...byCat.entries()]
      .map(([name, items]) => ({
        name,
        sortOrder: items[0]?.item.category?.sortOrder ?? 0,
        items: [...items].sort((a, b) => (a.item.sortOrder ?? 0) - (b.item.sortOrder ?? 0)),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [detail]);

  const grandTotals = useMemo(() => sumLines(detail?.lines ?? []), [detail]);

  const branchLabel = row.branch.code ? `${row.branch.code} — ${row.branch.name}` : row.branch.name;

  return (
    <Modal
      open
      size="xl"
      onClose={onClose}
      title={branchLabel}
      description={`${formatMonth(month)} · ${row.submittedAt ? `Submitted ${new Date(row.submittedAt).toLocaleString()}` : "No submission recorded"}`}
      headerExtra={<StatusBadge status={row.status} />}
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={22} className="animate-spin text-ios-foreground-subtle" />
        </div>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : !detail?.statement ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-ios-border-subtle/60 border border-ios-border-subtle flex items-center justify-center">
            <ClipboardCheck size={22} className="text-ios-foreground-subtle" strokeWidth={1.75} />
          </div>
          <p className="text-label font-semibold text-ios-foreground">No statement for this month</p>
          <p className="text-caption text-ios-foreground-faint max-w-sm mx-auto">
            {branchLabel} has not submitted an inventory statement for {formatMonth(month)}.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ios-border-subtle/30 border border-ios-border-subtle px-4 py-2.5 text-caption">
            <span className="text-ios-foreground-subtle">
              {detail.lines.length} line item(s) · {groups.length} categor{(groups.length === 1 ? "y" : "ies")}
            </span>
            {detail.statement.submittedAt && (
              <span className="text-ios-foreground-subtle">
                Submitted by{" "}
                <span className="font-semibold text-ios-foreground">{row.submittedBy?.name ?? "—"}</span> ·{" "}
                {new Date(detail.statement.submittedAt).toLocaleString()}
              </span>
            )}
          </div>

          {groups.map((group) => {
            const subtotal = sumLines(group.items);
            return (
              <div key={group.name}>
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <h4 className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
                    {group.name}
                  </h4>
                  <span className="text-micro font-semibold text-ios-foreground-faint">{group.items.length} items</span>
                </div>
                <div className="rounded-xl border border-ios-border-subtle overflow-hidden">
                  <Table>
                    <THead>
                      <THeadRow>
                        <TH>Item</TH>
                        <TH align="right">Opening</TH>
                        <TH align="right">Added</TH>
                        <TH align="right">Broken / Lost</TH>
                        <TH align="right">Reject</TH>
                        <TH align="right">Closing</TH>
                      </THeadRow>
                    </THead>
                    <tbody>
                      {group.items.map((line) => (
                        <TR key={line.id}>
                          <TD>
                            <span className="text-caption font-semibold text-ios-foreground">{line.item.name}</span>
                          </TD>
                          <TD align="right"><TotalsCell value={line.openingStock} /></TD>
                          <TD align="right"><TotalsCell value={line.added} /></TD>
                          <TD align="right"><TotalsCell value={line.brokenLost} /></TD>
                          <TD align="right"><TotalsCell value={line.reject} /></TD>
                          <TD align="right"><TotalsCell value={line.closingStock} strong /></TD>
                        </TR>
                      ))}
                      <tr className="border-t border-ios-border-subtle bg-ios-border-subtle/20">
                        <TD className="text-caption font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">
                          Subtotal
                        </TD>
                        <TD align="right"><TotalsCell value={subtotal.openingStock} strong /></TD>
                        <TD align="right"><TotalsCell value={subtotal.added} strong /></TD>
                        <TD align="right"><TotalsCell value={subtotal.brokenLost} strong /></TD>
                        <TD align="right"><TotalsCell value={subtotal.reject} strong /></TD>
                        <TD align="right"><TotalsCell value={subtotal.closingStock} strong /></TD>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between gap-4 rounded-xl bg-ios-primary/[0.06] border border-ios-primary/15 px-4 py-3">
            <span className="text-label font-bold text-ios-foreground">Grand Total</span>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-caption">
              <span className="text-ios-foreground-subtle">Opening <b className="tabular-nums text-ios-foreground">{grandTotals.openingStock}</b></span>
              <span className="text-ios-foreground-subtle">Added <b className="tabular-nums text-ios-foreground">{grandTotals.added}</b></span>
              <span className="text-ios-foreground-subtle">Broken / Lost <b className="tabular-nums text-ios-foreground">{grandTotals.brokenLost}</b></span>
              <span className="text-ios-foreground-subtle">Reject <b className="tabular-nums text-ios-foreground">{grandTotals.reject}</b></span>
              <span className="text-ios-foreground-subtle">Closing <b className="tabular-nums text-ios-primary">{grandTotals.closingStock}</b></span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
