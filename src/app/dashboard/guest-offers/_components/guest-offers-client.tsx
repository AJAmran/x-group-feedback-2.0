"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardUser } from "../../dashboard-context";
import {
  Trash2,
  X,
  Check,
  Clock,
  BadgePercent,
  UtensilsCrossed,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getBranchList } from "@/features/dashboard/actions";
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

const STATUS_STYLES: Record<ApprovalStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  APPROVED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
};

function StatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider border ${STATUS_STYLES[status]}`}>
      {status === "PENDING" ? <Clock size={12} /> : status === "APPROVED" ? <Check size={12} /> : <X size={12} />}
      {status}
    </span>
  );
}

function DiscountForm({ branches, onClose, onSaved }: { branches: BranchOption[]; onClose: () => void; onSaved: () => void }) {
  const user = useDashboardUser();
  const isManager = user.role === "BRANCH_MANAGER";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    branchId: user.branchId ?? (branches[0] ? Number(branches[0].id) : 0),
    logDate: today(),
    guestName: "",
    mobile: "",
    hadLunch: false,
    hadDinner: false,
    totalBill: "",
    discountPercent: "",
    reasonForDiscount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const result = await createDiscountAction({
      branchId: form.branchId,
      logDate: form.logDate,
      guestName: form.guestName,
      mobile: form.mobile,
      hadLunch: form.hadLunch,
      hadDinner: form.hadDinner,
      totalBill: Number(form.totalBill),
      discountPercent: Number(form.discountPercent),
      reasonForDiscount: form.reasonForDiscount,
    });
    setSaving(false);
    if (result.success) {
      onSaved();
      onClose();
    } else {
      setError(result.error || "Failed to create discount log");
    }
  };

  const inputClass = "squircle-input w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass-card p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-label font-bold text-ios-foreground">New Discount Log</h2>
            <p className="text-caption text-ios-foreground-muted mt-0.5">Record a guest discount offer</p>
          </div>
          <Button variant="icon" size="sm" onClick={onClose} aria-label="Close" icon={X} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isManager && (
              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Branch</label>
                <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: Number(e.target.value) })} className={`${inputClass} appearance-none`}>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.code} — {b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-ios-foreground-muted">Date</label>
              <input required type="date" value={form.logDate} onChange={(e) => setForm({ ...form, logDate: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-ios-foreground-muted">Guest Name</label>
              <input required value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-ios-foreground-muted">Mobile</label>
              <input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-label font-semibold text-ios-foreground-muted">
              <input type="checkbox" checked={form.hadLunch} onChange={(e) => setForm({ ...form, hadLunch: e.target.checked })} className="w-4 h-4 rounded text-ios-primary" />
              Lunch
            </label>
            <label className="flex items-center gap-2 text-label font-semibold text-ios-foreground-muted">
              <input type="checkbox" checked={form.hadDinner} onChange={(e) => setForm({ ...form, hadDinner: e.target.checked })} className="w-4 h-4 rounded text-ios-primary" />
              Dinner
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-ios-foreground-muted">Total Bill (BDT)</label>
              <input required type="number" min="0" step="0.01" value={form.totalBill} onChange={(e) => setForm({ ...form, totalBill: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-ios-foreground-muted">Discount %</label>
              <input required type="number" min="0" max="100" step="0.01" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-caption font-semibold text-ios-foreground-muted">Reason for Discount</label>
            <textarea rows={2} required value={form.reasonForDiscount} onChange={(e) => setForm({ ...form, reasonForDiscount: e.target.value })} className={inputClass} />
          </div>

          {form.totalBill && form.discountPercent && (
            <p className="text-caption text-ios-foreground-subtle">
              Discount amount: <span className="font-bold text-ios-primary">৳{(Number(form.totalBill) * Number(form.discountPercent) / 100).toFixed(2)}</span>
            </p>
          )}

          {error && (
            <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-caption font-semibold">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button variant="primary" type="submit" loading={saving} className="flex-1">Create Log</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EntertainmentForm({ branches, onClose, onSaved }: { branches: BranchOption[]; onClose: () => void; onSaved: () => void }) {
  const user = useDashboardUser();
  const isManager = user.role === "BRANCH_MANAGER";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    branchId: user.branchId ?? (branches[0] ? Number(branches[0].id) : 0),
    logDate: today(),
    guestName: "",
    mobile: "",
    hadLunch: false,
    hadDinner: false,
    foodName: "",
    foodCost: "",
    reasonForEntertainment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const result = await createEntertainmentAction({
      branchId: form.branchId,
      logDate: form.logDate,
      guestName: form.guestName,
      mobile: form.mobile,
      hadLunch: form.hadLunch,
      hadDinner: form.hadDinner,
      foodName: form.foodName,
      foodCost: Number(form.foodCost),
      reasonForEntertainment: form.reasonForEntertainment,
    });
    setSaving(false);
    if (result.success) {
      onSaved();
      onClose();
    } else {
      setError(result.error || "Failed to create entertainment log");
    }
  };

  const inputClass = "squircle-input w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass-card p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-label font-bold text-ios-foreground">New Entertainment Log</h2>
            <p className="text-caption text-ios-foreground-muted mt-0.5">Record complimentary food offered to a guest</p>
          </div>
          <Button variant="icon" size="sm" onClick={onClose} aria-label="Close" icon={X} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isManager && (
              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Branch</label>
                <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: Number(e.target.value) })} className={`${inputClass} appearance-none`}>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.code} — {b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-ios-foreground-muted">Date</label>
              <input required type="date" value={form.logDate} onChange={(e) => setForm({ ...form, logDate: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-ios-foreground-muted">Guest Name</label>
              <input required value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-ios-foreground-muted">Mobile</label>
              <input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-label font-semibold text-ios-foreground-muted">
              <input type="checkbox" checked={form.hadLunch} onChange={(e) => setForm({ ...form, hadLunch: e.target.checked })} className="w-4 h-4 rounded text-ios-primary" />
              Lunch
            </label>
            <label className="flex items-center gap-2 text-label font-semibold text-ios-foreground-muted">
              <input type="checkbox" checked={form.hadDinner} onChange={(e) => setForm({ ...form, hadDinner: e.target.checked })} className="w-4 h-4 rounded text-ios-primary" />
              Dinner
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-ios-foreground-muted">Food Name</label>
              <input required value={form.foodName} onChange={(e) => setForm({ ...form, foodName: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-ios-foreground-muted">Food Cost (BDT)</label>
              <input required type="number" min="0" step="0.01" value={form.foodCost} onChange={(e) => setForm({ ...form, foodCost: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-caption font-semibold text-ios-foreground-muted">Reason for Entertainment</label>
            <textarea rows={2} required value={form.reasonForEntertainment} onChange={(e) => setForm({ ...form, reasonForEntertainment: e.target.value })} className={inputClass} />
          </div>

          {error && (
            <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-caption font-semibold">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button variant="primary" type="submit" loading={saving} className="flex-1">Create Log</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function GuestOffersClient() {
  const router = useRouter();
  const user = useDashboardUser();
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [tab, setTab] = useState<Tab>("discounts");
  const [discountData, setDiscountData] = useState<PaginatedResult<DiscountLogItem>>({ items: [], total: 0, page: 1, totalPages: 0 });
  const [entertainmentData, setEntertainmentData] = useState<PaginatedResult<EntertainmentLogItem>>({ items: [], total: 0, page: 1, totalPages: 0 });
  const [summary, setSummary] = useState<GuestOfferSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [showEntertainmentForm, setShowEntertainmentForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "">("");
  const [approving, setApproving] = useState<{ kind: "discount" | "entertainment"; id: number; status: "APPROVED" | "REJECTED" } | null>(null);
  const [deleting, setDeleting] = useState<{ kind: "discount" | "entertainment"; id: number } | null>(null);

  const load = useCallback(async () => {
    const status = statusFilter || undefined;
    const [d, e, s] = await Promise.all([
      getDiscountLogs({ page: 1, limit: 25, approvalStatus: status }),
      getEntertainmentLogs({ page: 1, limit: 25, approvalStatus: status }),
      getGuestOfferSummary(),
    ]);
    setDiscountData(d);
    setEntertainmentData(e);
    setSummary(s);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    if (!isAdmin) return;
    getBranchList().then(setBranches);
  }, [isAdmin]);

  const handleApprove = async (kind: "discount" | "entertainment", id: number, status: "APPROVED" | "REJECTED") => {
    setApproving({ kind, id, status });
    const result =
      kind === "discount"
        ? await setDiscountApprovalAction(id, status)
        : await setEntertainmentApprovalAction(id, status);
    setApproving(null);
    if (result.success) {
      router.refresh();
      void load();
    }
  };

  const handleDelete = async (kind: "discount" | "entertainment", id: number) => {
    if (!confirm("Delete this log?")) return;
    setDeleting({ kind, id });
    const result =
      kind === "discount"
        ? await deleteDiscountAction(id)
        : await deleteEntertainmentAction(id);
    setDeleting(null);
    if (result.success) {
      router.refresh();
      void load();
    }
  };

  const tabClass = (active: boolean) =>
    `px-4 py-2 rounded-xl text-caption font-bold transition-all ${active ? "bg-ios-primary/10 text-ios-primary" : "text-ios-foreground-subtle hover:text-ios-foreground hover:bg-ios-border-subtle"}`;

  return (
    <>
      {showDiscountForm && <DiscountForm branches={branches} onClose={() => setShowDiscountForm(false)} onSaved={() => void load()} />}
      {showEntertainmentForm && <EntertainmentForm branches={branches} onClose={() => setShowEntertainmentForm(false)} onSaved={() => void load()} />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="glass-card p-4 rounded-3xl flex items-center gap-6">
          <div>
            <p className="text-micro font-bold uppercase tracking-wider text-ios-foreground-faint">Total Discounts</p>
            <p className="text-display font-extrabold text-ios-foreground">৳{summary?.discount.totalDiscountAmount?.toFixed(2) ?? "0.00"}</p>
          </div>
          <div className="w-px h-10 bg-ios-border-subtle" />
          <div>
            <p className="text-micro font-bold uppercase tracking-wider text-ios-foreground-faint">Entertainment Cost</p>
            <p className="text-display font-extrabold text-ios-foreground">৳{summary?.entertainment.totalCost?.toFixed(2) ?? "0.00"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApprovalStatus | "")}
            className="squircle-input w-auto appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          {tab === "discounts" ? (
            <Button variant="primary" size="sm" icon={BadgePercent} onClick={() => setShowDiscountForm(true)}>New Discount</Button>
          ) : (
            <Button variant="primary" size="sm" icon={UtensilsCrossed} onClick={() => setShowEntertainmentForm(true)}>New Entertainment</Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className={tabClass(tab === "discounts")} onClick={() => setTab("discounts")}>Discount Logs</button>
        <button className={tabClass(tab === "entertainments")} onClick={() => setTab("entertainments")}>Entertainment Logs</button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        {tab === "discounts" ? (
          <DiscountTable
            data={discountData}
            loading={loading}
            isAdmin={isAdmin}
            approving={approving}
            deleting={deleting}
            onApprove={handleApprove}
            onDelete={handleDelete}
          />
        ) : (
          <EntertainmentTable
            data={entertainmentData}
            loading={loading}
            isAdmin={isAdmin}
            approving={approving}
            deleting={deleting}
            onApprove={handleApprove}
            onDelete={handleDelete}
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
}: {
  data: PaginatedResult<DiscountLogItem>;
  loading: boolean;
  isAdmin: boolean;
  approving: { kind: "discount" | "entertainment"; id: number; status: "APPROVED" | "REJECTED" } | null;
  deleting: { kind: "discount" | "entertainment"; id: number } | null;
  onApprove: (kind: "discount" | "entertainment", id: number, status: "APPROVED" | "REJECTED") => void;
  onDelete: (kind: "discount" | "entertainment", id: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ios-border-subtle">
            <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Date</th>
            <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Guest</th>
            <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Bill</th>
            <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Discount</th>
            <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Reason</th>
            <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Status</th>
            <th className="text-right px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="text-center py-16"><p className="text-caption text-ios-foreground-subtle font-medium">Loading…</p></td></tr>
          ) : data.items.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <BadgePercent size={32} className="text-ios-foreground-faint" />
                  <p className="text-label font-semibold text-ios-foreground-subtle">No discount logs found</p>
                </div>
              </td>
            </tr>
          ) : (
            data.items.map((log) => (
              <tr key={log.id} className="border-b border-ios-border-subtle last:border-0 hover:bg-ios-border-subtle/50 transition-colors">
                <td className="px-4 py-3.5"><span className="text-label font-semibold text-ios-foreground">{log.logDate}</span></td>
                <td className="px-4 py-3.5">
                  <div>
                    <p className="text-label font-semibold text-ios-foreground">{log.guestName}</p>
                    <p className="text-micro text-ios-foreground-subtle flex items-center gap-1"><Phone size={11} /> {log.mobile}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5"><span className="text-label text-ios-foreground-muted">৳{Number(log.totalBill).toFixed(2)}</span></td>
                <td className="px-4 py-3.5">
                  <span className="text-label font-bold text-ios-primary">{log.discountPercent}%</span>
                  <span className="text-caption text-ios-foreground-subtle block">৳{Number(log.discountAmount).toFixed(2)}</span>
                </td>
                <td className="px-4 py-3.5"><span className="text-caption text-ios-foreground-subtle line-clamp-2 max-w-[240px] block">{log.reasonForDiscount}</span></td>
                <td className="px-4 py-3.5"><StatusBadge status={log.approvalStatus} /></td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {isAdmin && log.approvalStatus === "PENDING" && (
                      <>
                        <Button
                          variant="ghost-green"
                          size="sm"
                          icon={Check}
                          loading={approving?.kind === "discount" && approving.id === log.id && approving.status === "APPROVED"}
                          onClick={() => onApprove("discount", log.id, "APPROVED")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost-red"
                          size="sm"
                          icon={X}
                          loading={approving?.kind === "discount" && approving.id === log.id && approving.status === "REJECTED"}
                          onClick={() => onApprove("discount", log.id, "REJECTED")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost-red"
                      icon={Trash2}
                      disabled={deleting?.kind === "discount" && deleting.id === log.id}
                      loading={deleting?.kind === "discount" && deleting.id === log.id}
                      onClick={() => onDelete("discount", log.id)}
                      title="Delete"
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
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
}: {
  data: PaginatedResult<EntertainmentLogItem>;
  loading: boolean;
  isAdmin: boolean;
  approving: { kind: "discount" | "entertainment"; id: number; status: "APPROVED" | "REJECTED" } | null;
  deleting: { kind: "discount" | "entertainment"; id: number } | null;
  onApprove: (kind: "discount" | "entertainment", id: number, status: "APPROVED" | "REJECTED") => void;
  onDelete: (kind: "discount" | "entertainment", id: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ios-border-subtle">
            <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Date</th>
            <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Guest</th>
            <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Food</th>
            <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Cost</th>
            <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Reason</th>
            <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Status</th>
            <th className="text-right px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="text-center py-16"><p className="text-caption text-ios-foreground-subtle font-medium">Loading…</p></td></tr>
          ) : data.items.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <UtensilsCrossed size={32} className="text-ios-foreground-faint" />
                  <p className="text-label font-semibold text-ios-foreground-subtle">No entertainment logs found</p>
                </div>
              </td>
            </tr>
          ) : (
            data.items.map((log) => (
              <tr key={log.id} className="border-b border-ios-border-subtle last:border-0 hover:bg-ios-border-subtle/50 transition-colors">
                <td className="px-4 py-3.5"><span className="text-label font-semibold text-ios-foreground">{log.logDate}</span></td>
                <td className="px-4 py-3.5">
                  <div>
                    <p className="text-label font-semibold text-ios-foreground">{log.guestName}</p>
                    <p className="text-micro text-ios-foreground-subtle flex items-center gap-1"><Phone size={11} /> {log.mobile}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5"><span className="text-label text-ios-foreground-muted">{log.foodName}</span></td>
                <td className="px-4 py-3.5"><span className="text-label font-bold text-ios-primary">৳{Number(log.foodCost).toFixed(2)}</span></td>
                <td className="px-4 py-3.5"><span className="text-caption text-ios-foreground-subtle line-clamp-2 max-w-[240px] block">{log.reasonForEntertainment}</span></td>
                <td className="px-4 py-3.5"><StatusBadge status={log.approvalStatus} /></td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {isAdmin && log.approvalStatus === "PENDING" && (
                      <>
                        <Button
                          variant="ghost-green"
                          size="sm"
                          icon={Check}
                          loading={approving?.kind === "entertainment" && approving.id === log.id && approving.status === "APPROVED"}
                          onClick={() => onApprove("entertainment", log.id, "APPROVED")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost-red"
                          size="sm"
                          icon={X}
                          loading={approving?.kind === "entertainment" && approving.id === log.id && approving.status === "REJECTED"}
                          onClick={() => onApprove("entertainment", log.id, "REJECTED")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost-red"
                      icon={Trash2}
                      disabled={deleting?.kind === "entertainment" && deleting.id === log.id}
                      loading={deleting?.kind === "entertainment" && deleting.id === log.id}
                      onClick={() => onDelete("entertainment", log.id)}
                      title="Delete"
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
