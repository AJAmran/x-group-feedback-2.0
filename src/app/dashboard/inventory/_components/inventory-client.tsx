"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardUser } from "../../dashboard-context";
import {
  Plus,
  X,
  Save,
  Send,
  PackageCheck,
  Boxes,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  getInventoryStatements,
  getInventoryStatementLines,
  createInventoryStatementAction,
  updateInventoryStatementLinesAction,
  updateInventoryStatementStatusAction,
} from "@/features/inventory/actions";
import type {
  InventoryStatement,
  InventoryLine,
  InventoryStatus,
  PaginatedResult,
} from "@/features/inventory/actions";

const STATUS_STYLES: Record<InventoryStatus, string> = {
  DRAFT: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  SUBMITTED: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",
  LOCKED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function LinesEditor({ statement, onClose }: { statement: InventoryStatement; onClose: () => void }) {
  const router = useRouter();
  const user = useDashboardUser();
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
  const [lines, setLines] = useState<InventoryLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    const result = await getInventoryStatementLines(statement.id);
    setLines(result);
    setLoading(false);
  }, [statement.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const setValue = (itemId: number, field: "added" | "brokenLost" | "reject", value: string) => {
    const num = Math.max(0, Math.floor(Number(value) || 0));
    setLines((prev) => prev.map((l) => (l.itemId === itemId ? { ...l, [field]: num } : l)));
  };

  const grouped = lines.reduce<Record<string, InventoryLine[]>>((acc, line) => {
    const key = line.item.category.name;
    (acc[key] ??= []).push(line);
    return acc;
  }, {});

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const payload = lines.map((l) => ({ itemId: l.itemId, added: l.added, brokenLost: l.brokenLost, reject: l.reject }));
    const result = await updateInventoryStatementLinesAction(statement.id, payload);
    setSaving(false);
    setMessage(result.success
      ? { type: "ok", text: "Lines saved. Closing stock recalculated." }
      : { type: "err", text: result.error || "Failed to save lines" });
    if (result.success) void load();
  };

  const handleSubmit = async () => {
    if (!confirm("Submit this statement for review? Closing stock will be recalculated.")) return;
    setSubmitting(true);
    setMessage(null);
    const payload = lines.map((l) => ({ itemId: l.itemId, added: l.added, brokenLost: l.brokenLost, reject: l.reject }));
    const saved = await updateInventoryStatementLinesAction(statement.id, payload);
    if (!saved.success) {
      setSubmitting(false);
      setMessage({ type: "err", text: saved.error || "Failed to save lines" });
      return;
    }
    const result = await updateInventoryStatementStatusAction(statement.id, "SUBMITTED");
    setSubmitting(false);
    setMessage(result.success
      ? { type: "ok", text: "Statement submitted successfully." }
      : { type: "err", text: result.error || "Failed to submit statement" });
    if (result.success) {
      router.refresh();
      void load();
    }
  };

  const readonly = statement.status === "LOCKED" || statement.status === "SUBMITTED";
  const editable = !readonly;

  const inputClass = (rowValue: number) =>
    `w-20 h-9 rounded-lg border px-2 text-center text-label font-semibold ${
      readonly
        ? "bg-ios-border-subtle/30 text-ios-foreground-subtle cursor-not-allowed"
        : "squircle-input"
    } ${rowValue > 0 ? "text-ios-primary" : "text-ios-foreground-muted"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-label font-bold text-ios-foreground">Inventory Statement — {statement.statementMonth}</h2>
            <p className="text-caption text-ios-foreground-muted mt-0.5">
              {statement.branch?.name ?? `Branch #${statement.branchId}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider border ${STATUS_STYLES[statement.status]}`}>
              <Boxes size={12} /> {statement.status}
            </span>
            <Button variant="icon" size="sm" onClick={onClose} aria-label="Close" icon={X} />
          </div>
        </div>

        {editable && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-ios-primary/5 border border-ios-primary/15 text-caption text-ios-foreground-subtle">
            Opening stock is carried over from the previous month. Enter the additions, breakages/losses and rejects, then save.
          </div>
        )}

        {message && (
          <div className={`mb-4 px-3 py-2 rounded-xl border text-caption font-semibold ${
            message.type === "ok"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <p className="text-center py-12 text-caption text-ios-foreground-subtle font-medium">Loading lines…</p>
        ) : (
          Object.entries(grouped).map(([category, catLines]) => (
            <div key={category} className="mb-5">
              <h3 className="text-caption font-bold uppercase tracking-wider text-ios-foreground-subtle mb-2">{category}</h3>
              <div className="overflow-x-auto rounded-2xl border border-ios-border-subtle">
                <table className="w-full">
                  <thead>
                    <tr className="bg-ios-border-subtle/30">
                      <th className="text-left px-4 py-2.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Item</th>
                      <th className="text-center px-2 py-2.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Opening</th>
                      <th className="text-center px-2 py-2.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Added</th>
                      <th className="text-center px-2 py-2.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Broken / Lost</th>
                      <th className="text-center px-2 py-2.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Reject</th>
                      <th className="text-center px-4 py-2.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Closing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catLines.map((line) => (
                      <tr key={line.id} className="border-t border-ios-border-subtle">
                        <td className="px-4 py-2.5 text-label font-semibold text-ios-foreground">{line.item.name}</td>
                        <td className="px-2 py-2.5 text-center text-label font-semibold text-ios-foreground-muted">{line.openingStock}</td>
                        <td className="px-2 py-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            disabled={!editable}
                            value={line.added}
                            onChange={(e) => setValue(line.itemId, "added", e.target.value)}
                            className={inputClass(line.added)}
                          />
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            disabled={!editable}
                            value={line.brokenLost}
                            onChange={(e) => setValue(line.itemId, "brokenLost", e.target.value)}
                            className={inputClass(line.brokenLost)}
                          />
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            disabled={!editable}
                            value={line.reject}
                            onChange={(e) => setValue(line.itemId, "reject", e.target.value)}
                            className={inputClass(line.reject)}
                          />
                        </td>
                        <td className="px-4 py-2.5 text-center text-label font-extrabold text-ios-primary">
                          {line.openingStock + line.added - line.brokenLost - line.reject}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}

        {editable && (
          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">Close</Button>
            <Button variant="secondary" icon={Save} loading={saving} onClick={handleSave} className="flex-1">Save Lines</Button>
            <Button variant="primary" icon={Send} loading={submitting} onClick={handleSubmit} className="flex-1">Save & Submit</Button>
          </div>
        )}

        {readonly && (
          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">Close</Button>
            {isAdmin && statement.status === "SUBMITTED" && (
              <Button variant="primary" icon={Lock} className="flex-1" onClick={async () => {
                const result = await updateInventoryStatementStatusAction(statement.id, "LOCKED");
                if (result.success) { router.refresh(); void load(); }
              }}>
                Lock Statement
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function InventoryClient() {
  const router = useRouter();

  const [data, setData] = useState<PaginatedResult<InventoryStatement>>({ items: [], total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "">("");
  const [showCreate, setShowCreate] = useState(false);
  const [newMonth, setNewMonth] = useState(currentMonth());
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [opening, setOpening] = useState<InventoryStatement | null>(null);

  const load = useCallback(async () => {
    const result = await getInventoryStatements({
      page,
      limit: 15,
      statementMonth: monthFilter || undefined,
      status: statusFilter || undefined,
    });
    setData(result);
    setLoading(false);
  }, [page, monthFilter, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError("");
    const result = await createInventoryStatementAction(newMonth);
    setCreating(false);
    if (result.success) {
      setShowCreate(false);
      router.refresh();
      void load();
    } else {
      setCreateError(result.error || "Failed to create statement");
    }
  };

  return (
    <>
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md glass-card p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-label font-bold text-ios-foreground">New Inventory Statement</h2>
                <p className="text-caption text-ios-foreground-muted mt-0.5">Opens a fresh statement with carried-over opening stock</p>
              </div>
              <Button variant="icon" size="sm" onClick={() => setShowCreate(false)} aria-label="Close" icon={X} />
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Statement Month</label>
                <input
                  required
                  type="month"
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                  className="squircle-input w-full"
                />
              </div>
              {createError && (
                <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-caption font-semibold">{createError}</div>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
                <Button variant="primary" type="button" loading={creating} onClick={handleCreate} className="flex-1">Create Statement</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {opening && <LinesEditor statement={opening} onClose={() => setOpening(null)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
            className="squircle-input w-auto"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as InventoryStatus | ""); setPage(1); }}
            className="squircle-input w-auto appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="LOCKED">Locked</option>
          </select>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowCreate(true)}>New Statement</Button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-ios-border-subtle flex items-center gap-2.5">
          <PackageCheck size={15} className="text-ios-foreground-subtle" />
          <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Statements</span>
          <span className="text-micro font-medium text-ios-foreground-faint bg-ios-border-subtle/50 px-2 py-0.5 rounded-full">
            {data.total} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ios-border-subtle">
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Month</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Branch</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Status</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Submitted</th>
                <th className="text-right px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-16"><p className="text-caption text-ios-foreground-subtle font-medium">Loading…</p></td></tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <PackageCheck size={32} className="text-ios-foreground-faint" />
                      <p className="text-label font-semibold text-ios-foreground-subtle">No statements found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((stmt) => (
                  <tr key={stmt.id} className="border-b border-ios-border-subtle last:border-0 hover:bg-ios-border-subtle/50 transition-colors">
                    <td className="px-4 py-3.5"><span className="text-label font-semibold text-ios-foreground">{stmt.statementMonth}</span></td>
                    <td className="px-4 py-3.5"><span className="text-label text-ios-foreground-muted">{stmt.branch?.name ?? `Branch #${stmt.branchId}`}</span></td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider border ${STATUS_STYLES[stmt.status]}`}>
                        <Boxes size={12} /> {stmt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-caption text-ios-foreground-subtle">
                        {stmt.submittedAt ? new Date(stmt.submittedAt).toLocaleString() : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button variant="ghost" size="sm" icon={Boxes} onClick={() => setOpening(stmt)}>
                        Open
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-ios-border-subtle bg-ios-border-subtle/20">
            <p className="text-caption text-ios-foreground-subtle font-medium">Page {data.page} of {data.totalPages}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page <= 1}
                className="w-8 h-8 rounded-lg hover:bg-ios-border-subtle disabled:opacity-30 disabled:cursor-not-allowed text-ios-foreground-subtle transition-colors flex items-center justify-center"
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={data.page >= data.totalPages}
                className="w-8 h-8 rounded-lg hover:bg-ios-border-subtle disabled:opacity-30 disabled:cursor-not-allowed text-ios-foreground-subtle transition-colors flex items-center justify-center"
                aria-label="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
