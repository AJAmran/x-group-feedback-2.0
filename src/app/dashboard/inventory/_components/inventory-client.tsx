"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardUser } from "../../dashboard-context";
import {
  Plus,
  Save,
  Send,
  PackageCheck,
  Boxes,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { TextInput } from "@/components/ui/TextInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Table, THead, THeadRow, TH, TD, TR, TableEmpty, TableLoading } from "@/components/dashboard/table";
import { Pagination } from "@/components/dashboard/pagination";
import { CardHeader } from "@/components/dashboard/card-header";
import { StatusBadge as StatusBadgeShared } from "@/components/dashboard/status-badge";
import { isAdminRole } from "@/lib/roles";
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

const STATUS_VARIANT: Record<InventoryStatus, "warning" | "info" | "success"> = {
  DRAFT: "warning",
  SUBMITTED: "info",
  LOCKED: "success",
};

function StatusBadge({ status }: { status: InventoryStatus }) {
  return (
    <StatusBadgeShared variant={STATUS_VARIANT[status]}>
      <Boxes size={12} /> {status}
    </StatusBadgeShared>
  );
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function Banner({ type, text }: { type: "ok" | "err"; text: string }) {
  const styles =
    type === "ok"
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
      : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400";
  return (
    <div className={`mb-4 px-3 py-2 rounded-xl border text-caption font-semibold ${styles}`}>{text}</div>
  );
}

function LinesEditor({ statement, onClose }: { statement: InventoryStatement; onClose: () => void }) {
  const router = useRouter();
  const user = useDashboardUser();
  const isAdmin = isAdminRole(user.role);
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
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={`Inventory Statement — ${statement.statementMonth}`}
      description={statement.branch?.name ?? `Branch #${statement.branchId}`}
      headerExtra={<StatusBadge status={statement.status} />}
    >
      {editable && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-ios-primary/5 border border-ios-primary/15 text-caption text-ios-foreground-subtle">
          Opening stock is carried over from the previous month. Enter the additions, breakages/losses and rejects, then save.
        </div>
      )}

      {message && <Banner type={message.type} text={message.text} />}

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
    </Modal>
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
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Inventory Statement"
        description="Opens a fresh statement with carried-over opening stock"
      >
        <div className="space-y-4">
          <FormField label="Statement Month" required>
            <TextInput
              required
              type="month"
              value={newMonth}
              onChange={(e) => setNewMonth(e.target.value)}
            />
          </FormField>
          {createError && <ErrorMessage>{createError}</ErrorMessage>}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" type="button" loading={creating} onClick={handleCreate} className="flex-1">Create Statement</Button>
          </div>
        </div>
      </Modal>

      {opening && <LinesEditor statement={opening} onClose={() => setOpening(null)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TextInput
            type="month"
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
            className="w-auto"
          />
          <SelectInput
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as InventoryStatus | ""); setPage(1); }}
            className="w-auto"
            options={[
              { value: "", label: "All Statuses" },
              { value: "DRAFT", label: "Draft" },
              { value: "SUBMITTED", label: "Submitted" },
              { value: "LOCKED", label: "Locked" },
            ]}
          />
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowCreate(true)}>New Statement</Button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <CardHeader icon={PackageCheck} title="Statements" count={data.total} />

        <Table>
          <THead>
            <THeadRow>
              <TH>Month</TH>
              <TH>Branch</TH>
              <TH>Status</TH>
              <TH>Submitted</TH>
              <TH align="right">Actions</TH>
            </THeadRow>
          </THead>
          <tbody>
            {loading ? (
              <TableLoading colSpan={5} />
            ) : data.items.length === 0 ? (
              <TableEmpty colSpan={5} icon={PackageCheck} title="No statements found" />
            ) : (
              data.items.map((stmt) => (
                <TR key={stmt.id}>
                  <TD>
                    <span className="text-label font-semibold text-ios-foreground">{stmt.statementMonth}</span>
                  </TD>
                  <TD>
                    <span className="text-label text-ios-foreground-muted">{stmt.branch?.name ?? `Branch #${stmt.branchId}`}</span>
                  </TD>
                  <TD>
                    <StatusBadge status={stmt.status} />
                  </TD>
                  <TD>
                    <span className="text-caption text-ios-foreground-subtle">
                      {stmt.submittedAt ? new Date(stmt.submittedAt).toLocaleString() : "—"}
                    </span>
                  </TD>
                  <TD align="right">
                    <Button variant="ghost" size="sm" icon={Boxes} onClick={() => setOpening(stmt)}>
                      Open
                    </Button>
                  </TD>
                </TR>
              ))
            )}
          </tbody>
        </Table>

        {data.totalPages > 1 && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            pageSize={15}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  );
}