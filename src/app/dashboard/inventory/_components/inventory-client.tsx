"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useDashboardUser } from "../../dashboard-context";
import {
  Plus,
  Save,
  Send,
  PackageCheck,
  Boxes,
  Lock,
  Settings2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { TextInput } from "@/components/ui/TextInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Table, THead, THeadRow, TH, TD, TR, TableEmpty, TableSkeletonRows } from "@/components/dashboard/table";
import { Pagination } from "@/components/dashboard/pagination";
import { CardHeader } from "@/components/dashboard/card-header";
import { StatusBadge as StatusBadgeShared } from "@/components/dashboard/status-badge";
import { isAdminRole } from "@/lib/roles";
import {
  getInventoryStatements,
  getInventoryStatementLines,
  getInventoryCategories,
  getInventoryItems,
  createInventoryStatementAction,
  createInventoryCategoryAction,
  createInventoryItemAction,
  deleteInventoryCategoryAction,
  deleteInventoryItemAction,
  updateInventoryStatementLinesAction,
  updateInventoryStatementStatusAction,
} from "@/features/inventory/actions";
import type {
  InventoryCategory,
  InventoryItem,
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

function formatMonth(month: string): string {
  const d = new Date(`${month}-01T00:00:00`);
  return format(d, "MMM yyyy");
}

const STATUS_OPTIONS: { value: InventoryStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "LOCKED", label: "Locked" },
];

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

  const setValue = (itemId: number, field: "openingStock" | "added" | "brokenLost" | "reject", value: string) => {
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
    const payload = lines.map((l) => ({
      itemId: l.itemId,
      ...(l.openingStockEditable ? { openingStock: l.openingStock } : {}),
      added: l.added,
      brokenLost: l.brokenLost,
      reject: l.reject,
    }));
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
    const payload = lines.map((l) => ({
      itemId: l.itemId,
      ...(l.openingStockEditable ? { openingStock: l.openingStock } : {}),
      added: l.added,
      brokenLost: l.brokenLost,
      reject: l.reject,
    }));
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
  const openingStockEditable = editable && (lines[0]?.openingStockEditable ?? statement.openingStockEditable ?? false);

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
      title={`Inventory Statement — ${formatMonth(statement.statementMonth)}`}
      description={statement.branch?.name ?? `Branch #${statement.branchId}`}
      headerExtra={<StatusBadge status={statement.status} />}
    >
      {editable && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-ios-primary/5 border border-ios-primary/15 text-caption text-ios-foreground-subtle">
          {openingStockEditable
            ? "This is the branch's first statement — enter the opening stock (physical count on hand), plus additions, breakages/losses and rejects."
            : "Opening stock is carried over from the previous month. Enter the additions, breakages/losses and rejects, then save."}
        </div>
      )}

      {message && <Banner type={message.type} text={message.text} />}

      {loading ? (
        <p className="text-center py-12 text-caption text-ios-foreground-subtle font-medium">Loading lines…</p>
      ) : (
        Object.entries(grouped).map(([category, catLines]) => {
          const totals = catLines.reduce(
            (acc, l) => ({
              opening: acc.opening + l.openingStock,
              added: acc.added + l.added,
              brokenLost: acc.brokenLost + l.brokenLost,
              reject: acc.reject + l.reject,
              closing: acc.closing + (l.openingStock + l.added - l.brokenLost - l.reject),
            }),
            { opening: 0, added: 0, brokenLost: 0, reject: 0, closing: 0 }
          );

          return (
            <div key={category} className="mb-6">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-1 h-4 rounded-full bg-ios-primary" aria-hidden="true" />
                <h3 className="text-caption font-bold uppercase tracking-wider text-ios-foreground-subtle">{category}</h3>
                <span className="text-micro font-semibold bg-ios-border-subtle/60 text-ios-foreground-subtle px-2 py-0.5 rounded-full">
                  {catLines.length} items
                </span>
              </div>
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
                        <td className="px-2 py-2.5 text-center">
                          {openingStockEditable ? (
                            <input
                              type="number"
                              min={0}
                              value={line.openingStock}
                              onChange={(e) => setValue(line.itemId, "openingStock", e.target.value)}
                              className={inputClass(line.openingStock)}
                            />
                          ) : (
                            <span className="text-label font-semibold text-ios-foreground-muted">{line.openingStock}</span>
                          )}
                        </td>
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
                  <tfoot>
                    <tr className="border-t border-ios-border-subtle bg-ios-border-subtle/20">
                      <td className="px-4 py-2.5 text-caption font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">মোট / Total</td>
                      <td className="px-2 py-2.5 text-center text-label font-bold text-ios-foreground">{totals.opening}</td>
                      <td className="px-2 py-2.5 text-center text-label font-bold text-ios-foreground">{totals.added}</td>
                      <td className="px-2 py-2.5 text-center text-label font-bold text-ios-foreground">{totals.brokenLost}</td>
                      <td className="px-2 py-2.5 text-center text-label font-bold text-ios-foreground">{totals.reject}</td>
                      <td className="px-4 py-2.5 text-center text-label font-extrabold text-ios-primary">{totals.closing}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })
      )}

      {editable && (
        <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-surface-200/95 backdrop-blur-md border-t border-ios-border-subtle rounded-b-3xl z-10 flex gap-3">
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

type PendingDelete =
  | { kind: "item"; id: number; name: string; category: string }
  | { kind: "category"; id: number; name: string; count: number };

function ManageItemsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [newCategory, setNewCategory] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [newItem, setNewItem] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [creatingItem, setCreatingItem] = useState(false);
  const [itemError, setItemError] = useState("");

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [cats, itms] = await Promise.all([getInventoryCategories(), getInventoryItems()]);
    setCategories(cats);
    setItems(itms);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) {
      setMessage(null);
      setNewCategory("");
      setNewItem("");
      setNewItemCategory("");
      setPendingDelete(null);
    }
  }, [open]);

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    setCategoryError("");
    setCreatingCategory(true);
    const result = await createInventoryCategoryAction(name);
    setCreatingCategory(false);
    if (result.success) {
      setNewCategory("");
      setMessage({ type: "ok", text: `Category "${name}" created.` });
      void load();
    } else {
      setCategoryError(result.error || "Failed to create category");
    }
  };

  const handleAddItem = async () => {
    const name = newItem.trim();
    const categoryId = Number(newItemCategory);
    if (!name || !categoryId) return;
    setItemError("");
    setCreatingItem(true);
    const result = await createInventoryItemAction(categoryId, name);
    setCreatingItem(false);
    if (result.success) {
      setNewItem("");
      setMessage({ type: "ok", text: `Item "${name}" added.` });
      void load();
    } else {
      setItemError(result.error || "Failed to create item");
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setMessage(null);
    const result =
      pendingDelete.kind === "item"
        ? await deleteInventoryItemAction(pendingDelete.id)
        : await deleteInventoryCategoryAction(pendingDelete.id);
    setDeleting(false);
    if (result.success) {
      setMessage({
        type: "ok",
        text: pendingDelete.kind === "item"
          ? `Item "${pendingDelete.name}" deleted.`
          : `Category "${pendingDelete.name}" deleted.`,
      });
      setPendingDelete(null);
      void load();
    } else {
      setMessage({ type: "err", text: result.error || "Failed to delete" });
    }
  };

  const itemsByCategory = items.reduce<Record<number, InventoryItem[]>>((acc, item) => {
    (acc[item.categoryId] ??= []).push(item);
    return acc;
  }, {});

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Manage Inventory Items"
      description="Add new items to a category or create a new category. Deleted items stay on historical statements."
    >
      {message && <Banner type={message.type} text={message.text} />}

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-ios-border-subtle bg-surface-200/50 p-4">
          <h3 className="text-caption font-bold uppercase tracking-wider text-ios-foreground-subtle mb-3">New Category</h3>
          <div className="space-y-3">
            <TextInput
              placeholder="e.g. Kitchen Equipment"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleAddCategory(); }}
            />
            {categoryError && <ErrorMessage>{categoryError}</ErrorMessage>}
            <Button variant="secondary" size="sm" icon={Plus} loading={creatingCategory} onClick={handleAddCategory}>
              Add Category
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-ios-border-subtle bg-surface-200/50 p-4">
          <h3 className="text-caption font-bold uppercase tracking-wider text-ios-foreground-subtle mb-3">New Item</h3>
          <div className="space-y-3">
            <SelectInput
              placeholder="Select a category"
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            />
            <TextInput
              placeholder="e.g. Salad Plate"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleAddItem(); }}
            />
            {itemError && <ErrorMessage>{itemError}</ErrorMessage>}
            <Button variant="primary" size="sm" icon={Plus} loading={creatingItem} onClick={handleAddItem}>
              Add Item
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[24rem] overflow-y-auto pr-1">
        {loading ? (
          <p className="text-center py-10 text-caption text-ios-foreground-subtle font-medium">Loading items…</p>
        ) : categories.length === 0 ? (
          <p className="text-center py-10 text-caption text-ios-foreground-subtle font-medium">No categories yet. Create one above.</p>
        ) : (
          categories.map((category) => {
            const catItems = itemsByCategory[category.id] ?? [];
            return (
              <div key={category.id} className="rounded-2xl border border-ios-border-subtle overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-ios-border-subtle/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1 h-4 rounded-full bg-ios-primary shrink-0" aria-hidden="true" />
                    <span className="text-label font-bold text-ios-foreground truncate">{category.name}</span>
                    <span className="text-micro font-semibold bg-ios-border-subtle/60 text-ios-foreground-subtle px-2 py-0.5 rounded-full shrink-0">
                      {catItems.length} items
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    className="text-ios-foreground-subtle hover:text-[oklch(var(--lacquer))] shrink-0"
                    onClick={() => setPendingDelete({ kind: "category", id: category.id, name: category.name, count: catItems.length })}
                  >
                    Delete
                  </Button>
                </div>
                {catItems.length > 0 && (
                  <ul className="divide-y divide-ios-border-subtle">
                    {catItems.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-2">
                        <span className="text-label text-ios-foreground-muted truncate">{item.name}</span>
                        <button
                          type="button"
                          aria-label={`Delete ${item.name}`}
                          className="p-1.5 rounded-lg text-ios-foreground-subtle hover:text-[oklch(var(--lacquer))] hover:bg-[oklch(var(--lacquer)/0.08)] transition-colors shrink-0"
                          onClick={() => setPendingDelete({ kind: "item", id: item.id, name: item.name, category: category.name })}
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Confirm Delete"
        confirmLabel="Delete"
        message={
          pendingDelete?.kind === "item"
            ? <>Delete <strong>{pendingDelete.name}</strong> from <strong>{pendingDelete.category}</strong>? Existing statements keep their recorded values.</>
            : pendingDelete?.kind === "category"
              ? pendingDelete.count > 0
                ? <>Category <strong>{pendingDelete.name}</strong> has <strong>{pendingDelete.count} items</strong>. Its items are not deleted — you can move or delete them individually.</>
                : <>Delete empty category <strong>{pendingDelete.name}</strong>?</>
              : null
        }
      />
    </Modal>
  );
}

export function InventoryClient() {
  const router = useRouter();
  const user = useDashboardUser();
  const isAdmin = isAdminRole(user.role);

  const [data, setData] = useState<PaginatedResult<InventoryStatement>>({ items: [], total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "">("");
  const [showCreate, setShowCreate] = useState(false);
  const [showManage, setShowManage] = useState(false);
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
      {isAdmin && <ManageItemsModal open={showManage} onClose={() => setShowManage(false)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <TextInput
            type="month"
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
            className="w-auto"
          />
          <div className="inline-flex items-center p-1 gap-1 border border-ios-border-subtle bg-surface-200/70 rounded-xl w-fit">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                className={`px-3.5 h-9 rounded-lg text-micro font-bold transition-colors ${
                  statusFilter === opt.value
                    ? "btn-ios"
                    : "text-ios-foreground-subtle hover:bg-ios-border-subtle hover:text-ios-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <Button variant="outline" size="sm" icon={Settings2} onClick={() => setShowManage(true)}>
              Manage Items
            </Button>
          )}
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowCreate(true)}>New Statement</Button>
        </div>
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
              <TableSkeletonRows colSpan={5} rows={6} />
            ) : data.items.length === 0 ? (
              <TableEmpty colSpan={5} icon={PackageCheck} title="No statements found" />
            ) : (
              data.items.map((stmt) => (
                <TR
                  key={stmt.id}
                  className={stmt.status === "SUBMITTED" ? "bg-ios-primary/[0.03]" : undefined}
                >
                  <TD>
                    <span className="text-label font-semibold text-ios-foreground whitespace-nowrap">
                      {formatMonth(stmt.statementMonth)}
                    </span>
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
