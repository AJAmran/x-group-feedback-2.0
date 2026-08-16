"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDashboardUser } from "../../dashboard-context";
import {
  Trash2,
  X,
  Check,
  Clock,
  BadgePercent,
  UtensilsCrossed,
  Phone,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField } from "@/components/ui/FormField";
import { TextInput } from "@/components/ui/TextInput";
import { TextAreaInput } from "@/components/ui/TextAreaInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Table, THead, THeadRow, TH, TD, TR, TableEmpty, TableSkeletonRows } from "@/components/dashboard/table";
import { StatusBadge as StatusBadgeShared } from "@/components/dashboard/status-badge";
import { DateRangeFilter, FilterChip, FILTER_SELECT_CLASS } from "@/components/dashboard/filters";
import { OpsStatCard } from "@/components/dashboard/ops-stat-card";
import { StatsGridSkeleton } from "@/app/_components/skeleton";
import { isAdminRole, isBranchManager } from "@/lib/roles";
import {
  getDiscountLogs,
  getEntertainmentLogs,
  getGuestOfferSummary,
  createDiscountAction,
  createEntertainmentAction,
  setDiscountApprovalAction,
  setEntertainmentApprovalAction,
  deleteDiscountAction,
  deleteEntertainmentAction,
} from "@/features/guest-offer/actions";
import type {
  DiscountLogItem,
  EntertainmentLogItem,
  GuestOfferSummary,
  ApprovalStatus,
  PaginatedResult,
  OfferListParams,
} from "@/features/guest-offer/actions";

type Tab = "discounts" | "entertainments";

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_VARIANT: Record<ApprovalStatus, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

function StatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <StatusBadgeShared variant={STATUS_VARIANT[status]}>
      {status === "PENDING" ? <Clock size={12} /> : status === "APPROVED" ? <Check size={12} /> : <X size={12} />}
      {status}
    </StatusBadgeShared>
  );
}

const formatMoney = (value?: number) =>
  `৳${(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function BranchBadge({ code, id }: { code?: string; id: number }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-ios-primary/10 border border-ios-primary/15 text-micro font-semibold text-ios-primary">
      {code ?? `#${id}`}
    </span>
  );
}

function GuestCell({
  name,
  mobile,
  hadLunch,
  hadDinner,
}: {
  name: string;
  mobile: string;
  hadLunch?: boolean;
  hadDinner?: boolean;
}) {
  const meals = [hadLunch && "Lunch", hadDinner && "Dinner"].filter(Boolean) as string[];
  return (
    <div className="min-w-0">
      <p className="text-label font-semibold text-ios-foreground truncate">{name}</p>
      <p className="text-micro text-ios-foreground-subtle flex items-center gap-1">
        <Phone size={11} /> {mobile}
      </p>
      {meals.length > 0 && (
        <div className="flex items-center gap-1 mt-1">
          {meals.map((m) => (
            <span key={m} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-ios-border-subtle/60 text-micro font-bold text-ios-foreground-subtle">
              {m}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface CommonLogForm {
  branchId: number;
  logDate: string;
  guestName: string;
  mobile: string;
  hadLunch: boolean;
  hadDinner: boolean;
}

/** Shared modal shell for discount / entertainment log creation. */
function LogFormShell({
  branches,
  onClose,
  onSaved,
  title,
  description,
  submit,
  children,
}: {
  branches: BranchOption[];
  onClose: () => void;
  onSaved: () => void;
  title: string;
  description: string;
  submit: (common: CommonLogForm) => Promise<{ success: boolean; error?: string }>;
  children: (common: CommonLogForm, setCommon: (patch: Partial<CommonLogForm>) => void) => React.ReactNode;
}) {
  const user = useDashboardUser();
  const isManager = isBranchManager(user.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [common, setCommon] = useState<CommonLogForm>({
    branchId: isManager
      ? (user.branchId ?? 0)
      : (branches[0] ? Number(branches[0].id) : 0),
    logDate: today(),
    guestName: "",
    mobile: "",
    hadLunch: false,
    hadDinner: false,
  });
  const patchCommon = (p: Partial<CommonLogForm>) => setCommon((c) => ({ ...c, ...p }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    const result = await submit(common);
    setSaving(false);
    if (result.success) {
      onSaved();
      onClose();
    } else {
      setError(result.error || "Failed to save log");
    }
  };

  return (
    <Modal open onClose={onClose} title={title} description={description}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isManager && (
            <FormField label="Branch">
              <SelectInput
                value={String(common.branchId)}
                onChange={(e) => patchCommon({ branchId: Number(e.target.value) })}
                options={branches.map((b) => ({ value: b.id, label: `${b.code} — ${b.name}` }))}
              />
            </FormField>
          )}
          <FormField label="Date" required>
            <TextInput
              required
              type="date"
              value={common.logDate}
              onChange={(e) => patchCommon({ logDate: e.target.value })}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Guest Name" required>
            <TextInput
              required
              value={common.guestName}
              onChange={(e) => patchCommon({ guestName: e.target.value })}
            />
          </FormField>
          <FormField label="Mobile" required>
            <TextInput
              required
              value={common.mobile}
              onChange={(e) => patchCommon({ mobile: e.target.value })}
            />
          </FormField>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-label font-semibold text-ios-foreground-muted">
            <input
              type="checkbox"
              checked={common.hadLunch}
              onChange={(e) => patchCommon({ hadLunch: e.target.checked })}
              className="w-4 h-4 rounded text-ios-primary"
            />
            Lunch
          </label>
          <label className="flex items-center gap-2 text-label font-semibold text-ios-foreground-muted">
            <input
              type="checkbox"
              checked={common.hadDinner}
              onChange={(e) => patchCommon({ hadDinner: e.target.checked })}
              className="w-4 h-4 rounded text-ios-primary"
            />
            Dinner
          </label>
        </div>

        {children(common, patchCommon)}

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={saving} className="flex-1">Cancel</Button>
          <Button variant="primary" type="submit" loading={saving} className="flex-1">Create Log</Button>
        </div>
      </form>
    </Modal>
  );
}

function DiscountForm({ branches, onClose, onSaved }: { branches: BranchOption[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    totalBill: "",
    discountPercent: "",
    reasonForDiscount: "",
  });

  return (
    <LogFormShell
      branches={branches}
      onClose={onClose}
      onSaved={onSaved}
      title="New Discount Log"
      description="Record a guest discount offer"
      submit={(common) =>
        createDiscountAction({
          ...common,
          totalBill: Number(form.totalBill),
          discountPercent: Number(form.discountPercent),
          reasonForDiscount: form.reasonForDiscount,
        })
      }
    >
      {() => (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Total Bill (BDT)" required>
              <TextInput
                required
                type="number"
                min="0"
                step="0.01"
                value={form.totalBill}
                onChange={(e) => setForm({ ...form, totalBill: e.target.value })}
              />
            </FormField>
            <FormField label="Discount %" required>
              <TextInput
                required
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Reason for Discount" required>
            <TextAreaInput
              rows={2}
              required
              value={form.reasonForDiscount}
              onChange={(e) => setForm({ ...form, reasonForDiscount: e.target.value })}
            />
          </FormField>

          {form.totalBill && form.discountPercent && (
            <p className="text-caption text-ios-foreground-subtle">
              Discount amount:{" "}
              <span className="font-bold text-ios-primary">
                ৳{(Number(form.totalBill) * Number(form.discountPercent) / 100).toFixed(2)}
              </span>
            </p>
          )}
        </>
      )}
    </LogFormShell>
  );
}

function EntertainmentForm({ branches, onClose, onSaved }: { branches: BranchOption[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    foodName: "",
    foodCost: "",
    reasonForEntertainment: "",
  });

  return (
    <LogFormShell
      branches={branches}
      onClose={onClose}
      onSaved={onSaved}
      title="New Entertainment Log"
      description="Record complimentary food offered to a guest"
      submit={(common) =>
        createEntertainmentAction({
          ...common,
          foodName: form.foodName,
          foodCost: Number(form.foodCost),
          reasonForEntertainment: form.reasonForEntertainment,
        })
      }
    >
      {() => (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Food Name" required>
              <TextInput
                required
                value={form.foodName}
                onChange={(e) => setForm({ ...form, foodName: e.target.value })}
              />
            </FormField>
            <FormField label="Food Cost (BDT)" required>
              <TextInput
                required
                type="number"
                min="0"
                step="0.01"
                value={form.foodCost}
                onChange={(e) => setForm({ ...form, foodCost: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Reason for Entertainment" required>
            <TextAreaInput
              rows={2}
              required
              value={form.reasonForEntertainment}
              onChange={(e) => setForm({ ...form, reasonForEntertainment: e.target.value })}
            />
          </FormField>
        </>
      )}
    </LogFormShell>
  );
}

export function GuestOffersClient({
  initialDiscounts,
  initialEntertainments,
  initialSummary,
  initialPending,
  branches,
}: {
  initialDiscounts: PaginatedResult<DiscountLogItem>;
  initialEntertainments: PaginatedResult<EntertainmentLogItem>;
  initialSummary: GuestOfferSummary | null;
  initialPending: { discounts: number; entertainments: number };
  branches: BranchOption[];
}) {
  const user = useDashboardUser();
  const isAdmin = isAdminRole(user.role);

  const [tab, setTab] = useState<Tab>("discounts");
  const [discountData, setDiscountData] = useState<PaginatedResult<DiscountLogItem>>(initialDiscounts);
  const [entertainmentData, setEntertainmentData] = useState<PaginatedResult<EntertainmentLogItem>>(initialEntertainments);
  const [summary, setSummary] = useState<GuestOfferSummary | null>(initialSummary);
  const [pending, setPending] = useState(initialPending);
  const [loading, setLoading] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [showEntertainmentForm, setShowEntertainmentForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [approving, setApproving] = useState<{ kind: "discount" | "entertainment"; id: number; status: "APPROVED" | "REJECTED" } | null>(null);
  const [deleting, setDeleting] = useState<{ kind: "discount" | "entertainment"; id: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ kind: "discount" | "entertainment"; id: number } | null>(null);

  const load = useCallback(async () => {
    const params: OfferListParams = {
      page: 1,
      limit: 25,
      approvalStatus: statusFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      branchId: branchFilter ? Number(branchFilter) : undefined,
    };
    const [d, e, s] = await Promise.all([
      getDiscountLogs(params),
      getEntertainmentLogs(params),
      getGuestOfferSummary(params),
    ]);
    setDiscountData(d);
    setEntertainmentData(e);
    setSummary(s);
    const pending = await Promise.all([
      statusFilter === "PENDING"
        ? Promise.resolve(d.total)
        : getDiscountLogs({ page: 1, limit: 1, approvalStatus: "PENDING" }).then((r) => r.total),
      statusFilter === "PENDING"
        ? Promise.resolve(e.total)
        : getEntertainmentLogs({ page: 1, limit: 1, approvalStatus: "PENDING" }).then((r) => r.total),
    ]);
    setPending({ discounts: pending[0], entertainments: pending[1] });
    setLoading(false);
  }, [statusFilter, startDate, endDate, branchFilter]);

  // Initial data arrives from the server, so only refetch when the filters
  // actually change (skip the very first effect run).
  const skippedInitialLoad = useRef(false);
  useEffect(() => {
    if (!skippedInitialLoad.current) {
      skippedInitialLoad.current = true;
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleApprove = async (kind: "discount" | "entertainment", id: number, status: "APPROVED" | "REJECTED") => {
    if (approving != null) return;
    setApproving({ kind, id, status });
    const result =
      kind === "discount"
        ? await setDiscountApprovalAction(id, status)
        : await setEntertainmentApprovalAction(id, status);
    setApproving(null);
    if (result.success) {
      void load();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    if (deleting != null) return;
    setDeleting(confirmDelete);
    const result =
      confirmDelete.kind === "discount"
        ? await deleteDiscountAction(confirmDelete.id)
        : await deleteEntertainmentAction(confirmDelete.id);
    setDeleting(null);
    setConfirmDelete(null);
    if (result.success) {
      void load();
    }
  };

  const pendingTotal = pending.discounts + pending.entertainments;
  const hasFilters = statusFilter !== "" || startDate !== "" || endDate !== "" || branchFilter !== "";

  const clearFilters = () => {
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setBranchFilter("");
  };

  return (
    <>
      {showDiscountForm && <DiscountForm branches={branches} onClose={() => setShowDiscountForm(false)} onSaved={() => void load()} />}
      {showEntertainmentForm && <EntertainmentForm branches={branches} onClose={() => setShowEntertainmentForm(false)} onSaved={() => void load()} />}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting != null}
        title="Delete Log"
        message={
          <>
            Are you sure you want to delete this{" "}
            <span className="font-bold text-ios-foreground">
              {confirmDelete?.kind === "discount" ? "discount" : "entertainment"}
            </span>{" "}
            log? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      {loading ? (
        <StatsGridSkeleton count={3} cols="sm:grid-cols-3" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <OpsStatCard
            icon={BadgePercent}
            label="Total Discounts"
            value={formatMoney(summary?.discount.totalDiscountAmount)}
            tone="primary"
            subtext={`${summary?.discount.logs ?? 0} logs recorded`}
          />
          <OpsStatCard
            icon={UtensilsCrossed}
            label="Entertainment Cost"
            value={formatMoney(summary?.entertainment.totalCost)}
            tone="gold"
            subtext={`${summary?.entertainment.logs ?? 0} logs recorded`}
          />
          <OpsStatCard
            icon={Clock}
            label="Pending Approvals"
            value={pendingTotal}
            tone="amber"
            subtext={`${pending.discounts} discounts · ${pending.entertainments} entertainment`}
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="inline-flex items-center p-1 gap-1 border border-ios-border-subtle bg-surface-200/70 rounded-xl w-fit">
          <Button
            variant={tab === "discounts" ? "primary" : "outline"}
            size="sm"
            icon={BadgePercent}
            className="h-9!"
            onClick={() => setTab("discounts")}
          >
            Discount Logs
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-micro font-bold ${
              tab === "discounts" ? "bg-ios-on-primary/15 text-ios-on-primary" : "bg-ios-border-subtle/60 text-ios-foreground-subtle"
            }`}>
              {discountData.total}
            </span>
          </Button>
          <Button
            variant={tab === "entertainments" ? "primary" : "outline"}
            size="sm"
            icon={UtensilsCrossed}
            className="h-9!"
            onClick={() => setTab("entertainments")}
          >
            Entertainment Logs
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-micro font-bold ${
              tab === "entertainments" ? "bg-ios-on-primary/15 text-ios-on-primary" : "bg-ios-border-subtle/60 text-ios-foreground-subtle"
            }`}>
              {entertainmentData.total}
            </span>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <SelectInput
              className={FILTER_SELECT_CLASS}
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              options={[
                { value: "", label: "All Branches" },
                ...branches.map((b) => ({ value: b.id, label: `${b.code} — ${b.name}` })),
              ]}
            />
          )}
          <DateRangeFilter
            start={startDate}
            end={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
          />
          <SelectInput
            className={FILTER_SELECT_CLASS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApprovalStatus | "")}
            options={[
              { value: "", label: "All Statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
            ]}
          />
          {hasFilters && (
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={clearFilters}>
              Clear
            </Button>
          )}
          {tab === "discounts" ? (
            <Button variant="primary" size="sm" icon={BadgePercent} onClick={() => setShowDiscountForm(true)}>New Discount</Button>
          ) : (
            <Button variant="primary" size="sm" icon={UtensilsCrossed} onClick={() => setShowEntertainmentForm(true)}>New Entertainment</Button>
          )}
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {branchFilter && (
            <FilterChip
              label={`Branch: ${branches.find((b) => b.id === branchFilter)?.code ?? branchFilter}`}
              onClear={() => setBranchFilter("")}
            />
          )}
          {startDate && <FilterChip label={`From: ${startDate}`} onClear={() => setStartDate("")} />}
          {endDate && <FilterChip label={`To: ${endDate}`} onClear={() => setEndDate("")} />}
          {statusFilter && <FilterChip label={`Status: ${statusFilter}`} onClear={() => setStatusFilter("")} />}
        </div>
      )}

      <div className="rounded-2xl border border-ios-border-subtle bg-surface-300 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-ios-border-subtle flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-ios-primary/9 border border-ios-primary/10 text-ios-primary flex items-center justify-center shrink-0">
              {tab === "discounts" ? <BadgePercent size={15} strokeWidth={2} /> : <UtensilsCrossed size={15} strokeWidth={2} />}
            </div>
            <h3 className="text-label font-bold text-ios-foreground">
              {tab === "discounts" ? "Discount Logs" : "Entertainment Logs"}
            </h3>
            <span className="text-micro font-semibold bg-ios-primary/10 text-ios-primary px-2 py-0.5 rounded-full shrink-0">
              {tab === "discounts" ? discountData.total : entertainmentData.total}
            </span>
          </div>
        </div>
        {tab === "discounts" ? (
          <DiscountTable
            data={discountData}
            loading={loading}
            isAdmin={isAdmin}
            approving={approving}
            deleting={deleting}
            onApprove={handleApprove}
            onDelete={(kind, id) => setConfirmDelete({ kind, id })}
            onNew={() => setShowDiscountForm(true)}
          />
        ) : (
          <EntertainmentTable
            data={entertainmentData}
            loading={loading}
            isAdmin={isAdmin}
            approving={approving}
            deleting={deleting}
            onApprove={handleApprove}
            onDelete={(kind, id) => setConfirmDelete({ kind, id })}
            onNew={() => setShowEntertainmentForm(true)}
          />
        )}
      </div>
    </>
  );
}

function DiscountTable({
  data,
  loading,
  isAdmin,
  approving,
  deleting,
  onApprove,
  onDelete,
  onNew,
}: {
  data: PaginatedResult<DiscountLogItem>;
  loading: boolean;
  isAdmin: boolean;
  approving: { kind: "discount" | "entertainment"; id: number; status: "APPROVED" | "REJECTED" } | null;
  deleting: { kind: "discount" | "entertainment"; id: number } | null;
  onApprove: (kind: "discount" | "entertainment", id: number, status: "APPROVED" | "REJECTED") => void;
  onDelete: (kind: "discount" | "entertainment", id: number) => void;
  onNew: () => void;
}) {
  return (
    <Table>
      <THead>
        <THeadRow>
          <TH className="bg-ios-primary/[0.035]">Date</TH>
          <TH className="bg-ios-primary/[0.035]">Guest</TH>
          <TH className="bg-ios-primary/[0.035]">Branch</TH>
          <TH className="bg-ios-primary/[0.035]">Bill</TH>
          <TH className="bg-ios-primary/[0.035]">Discount</TH>
          <TH className="bg-ios-primary/[0.035]">Reason</TH>
          <TH className="bg-ios-primary/[0.035]">Status</TH>
          <TH className="bg-ios-primary/[0.035]" align="right">Actions</TH>
        </THeadRow>
      </THead>
      <tbody>
        {loading ? (
          <TableSkeletonRows colSpan={8} rows={6} />
        ) : data.items.length === 0 ? (
          <TableEmpty
            colSpan={8}
            icon={BadgePercent}
            title="No discount logs found"
            description="No guest discounts match the current filters. Record the first discount to get started."
            action={
              <Button variant="primary" size="sm" icon={Plus} onClick={onNew}>New Discount</Button>
            }
          />
        ) : (
          data.items.map((log) => (
            <TR
              key={log.id}
              className={log.approvalStatus === "PENDING" ? "bg-amber-500/[0.04]" : undefined}
            >
              <TD>
                <span className="text-caption font-bold text-ios-foreground whitespace-nowrap">{log.logDate}</span>
              </TD>
              <TD>
                <GuestCell name={log.guestName} mobile={log.mobile} hadLunch={log.hadLunch} hadDinner={log.hadDinner} />
              </TD>
              <TD>
                <BranchBadge code={log.branch?.code} id={log.branchId} />
              </TD>
              <TD>
                <span className="text-label font-medium text-ios-foreground-muted whitespace-nowrap">{formatMoney(log.totalBill)}</span>
              </TD>
              <TD>
                <span className="text-label font-bold text-ios-primary">{log.discountPercent}%</span>
                <span className="text-caption text-ios-foreground-subtle block whitespace-nowrap">{formatMoney(log.discountAmount)}</span>
              </TD>
              <TD>
                <span className="text-caption text-ios-foreground-subtle line-clamp-2 max-w-60 block">{log.reasonForDiscount}</span>
              </TD>
              <TD>
                <StatusBadge status={log.approvalStatus} />
              </TD>
              <TD align="right">
                <div className="flex items-center justify-end gap-1.5">
                  <div className="inline-flex items-center rounded-lg bg-ios-border-subtle/40 p-0.5">
                    <Button
                      variant="icon-danger"
                      size="sm"
                      disabled={approving != null || (deleting?.kind === "discount" && deleting.id === log.id)}
                      loading={deleting?.kind === "discount" && deleting.id === log.id}
                      onClick={() => onDelete("discount", log.id)}
                      icon={Trash2}
                      title="Delete"
                    />
                  </div>
                  {isAdmin && log.approvalStatus === "PENDING" && (
                    <>
                      <Button
                        variant="ghost-green"
                        size="sm"
                        icon={Check}
                        disabled={approving != null || deleting != null}
                        loading={approving?.kind === "discount" && approving.id === log.id && approving.status === "APPROVED"}
                        onClick={() => onApprove("discount", log.id, "APPROVED")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost-red"
                        size="sm"
                        icon={X}
                        disabled={approving != null || deleting != null}
                        loading={approving?.kind === "discount" && approving.id === log.id && approving.status === "REJECTED"}
                        onClick={() => onApprove("discount", log.id, "REJECTED")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TD>
            </TR>
          ))
        )}
      </tbody>
    </Table>
  );
}

function EntertainmentTable({
  data,
  loading,
  isAdmin,
  approving,
  deleting,
  onApprove,
  onDelete,
  onNew,
}: {
  data: PaginatedResult<EntertainmentLogItem>;
  loading: boolean;
  isAdmin: boolean;
  approving: { kind: "discount" | "entertainment"; id: number; status: "APPROVED" | "REJECTED" } | null;
  deleting: { kind: "discount" | "entertainment"; id: number } | null;
  onApprove: (kind: "discount" | "entertainment", id: number, status: "APPROVED" | "REJECTED") => void;
  onDelete: (kind: "discount" | "entertainment", id: number) => void;
  onNew: () => void;
}) {
  return (
    <Table>
      <THead>
        <THeadRow>
          <TH className="bg-ios-primary/[0.035]">Date</TH>
          <TH className="bg-ios-primary/[0.035]">Guest</TH>
          <TH className="bg-ios-primary/[0.035]">Branch</TH>
          <TH className="bg-ios-primary/[0.035]">Food</TH>
          <TH className="bg-ios-primary/[0.035]">Cost</TH>
          <TH className="bg-ios-primary/[0.035]">Reason</TH>
          <TH className="bg-ios-primary/[0.035]">Status</TH>
          <TH className="bg-ios-primary/[0.035]" align="right">Actions</TH>
        </THeadRow>
      </THead>
      <tbody>
        {loading ? (
          <TableSkeletonRows colSpan={8} rows={6} />
        ) : data.items.length === 0 ? (
          <TableEmpty
            colSpan={8}
            icon={UtensilsCrossed}
            title="No entertainment logs found"
            description="No complimentary food or entertainment matches the current filters. Record the first one to get started."
            action={
              <Button variant="primary" size="sm" icon={Plus} onClick={onNew}>New Entertainment</Button>
            }
          />
        ) : (
          data.items.map((log) => (
            <TR
              key={log.id}
              className={log.approvalStatus === "PENDING" ? "bg-amber-500/[0.04]" : undefined}
            >
              <TD>
                <span className="text-caption font-bold text-ios-foreground whitespace-nowrap">{log.logDate}</span>
              </TD>
              <TD>
                <GuestCell name={log.guestName} mobile={log.mobile} hadLunch={log.hadLunch} hadDinner={log.hadDinner} />
              </TD>
              <TD>
                <BranchBadge code={log.branch?.code} id={log.branchId} />
              </TD>
              <TD>
                <span className="text-label font-medium text-ios-foreground-muted">{log.foodName}</span>
              </TD>
              <TD>
                <span className="text-label font-bold text-ios-primary whitespace-nowrap">{formatMoney(log.foodCost)}</span>
              </TD>
              <TD>
                <span className="text-caption text-ios-foreground-subtle line-clamp-2 max-w-60 block">{log.reasonForEntertainment}</span>
              </TD>
              <TD>
                <StatusBadge status={log.approvalStatus} />
              </TD>
              <TD align="right">
                <div className="flex items-center justify-end gap-1.5">
                  <div className="inline-flex items-center rounded-lg bg-ios-border-subtle/40 p-0.5">
                    <Button
                      variant="icon-danger"
                      size="sm"
                      disabled={approving != null || (deleting?.kind === "entertainment" && deleting.id === log.id)}
                      loading={deleting?.kind === "entertainment" && deleting.id === log.id}
                      onClick={() => onDelete("entertainment", log.id)}
                      icon={Trash2}
                      title="Delete"
                    />
                  </div>
                  {isAdmin && log.approvalStatus === "PENDING" && (
                    <>
                      <Button
                        variant="ghost-green"
                        size="sm"
                        icon={Check}
                        disabled={approving != null || deleting != null}
                        loading={approving?.kind === "entertainment" && approving.id === log.id && approving.status === "APPROVED"}
                        onClick={() => onApprove("entertainment", log.id, "APPROVED")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost-red"
                        size="sm"
                        icon={X}
                        disabled={approving != null || deleting != null}
                        loading={approving?.kind === "entertainment" && approving.id === log.id && approving.status === "REJECTED"}
                        onClick={() => onApprove("entertainment", log.id, "REJECTED")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TD>
            </TR>
          ))
        )}
      </tbody>
    </Table>
  );
}
