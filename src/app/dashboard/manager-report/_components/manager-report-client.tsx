"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardUser } from "../../dashboard-context";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Phone,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getBranchList } from "@/features/dashboard/actions";
import {
  getManagerReports,
  createManagerReportAction,
  updateManagerReportAction,
  deleteManagerReportAction,
} from "@/features/manager-report/actions";
import type {
  ManagerReportItem,
  ManagerReportListResult,
  GuestComplaintInput,
  BpCpEntryInput,
} from "@/features/manager-report/actions";

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

interface ComplaintDraft {
  guestName: string;
  mobile: string;
  email: string;
  complaintDetails: string;
  serviceProviderName: string;
  responsiblePerson: string;
  actionTaken: string;
  solution: string;
}

interface BpCpDraft {
  entryType: "TODAY" | "TOMORROW";
  guestName: string;
  mobile: string;
  comment: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const emptyComplaint = (): ComplaintDraft => ({
  guestName: "",
  mobile: "",
  email: "",
  complaintDetails: "",
  serviceProviderName: "",
  responsiblePerson: "",
  actionTaken: "",
  solution: "",
});

const emptyBpCp = (): BpCpDraft => ({
  entryType: "TODAY",
  guestName: "",
  mobile: "",
  comment: "",
});

function ReportForm({
  branches,
  editing,
  onClose,
  onSaved,
}: {
  branches: BranchOption[];
  editing: ManagerReportItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const user = useDashboardUser();
  const isManager = user.role === "BRANCH_MANAGER";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    branchId: editing?.branchId ?? user.branchId ?? (branches[0] ? Number(branches[0].id) : 0),
    managerName: editing?.managerName ?? user.userName ?? "",
    reportDate: editing?.reportDate ?? today(),
    managerComments: editing?.managerComments ?? "",
    supplyPurchaseIssues: editing?.supplyPurchaseIssues ?? "",
    briefingPoints: editing?.briefingPoints ?? "",
    dailyLearnings: editing?.dailyLearnings ?? "",
  });
  const [complaints, setComplaints] = useState<ComplaintDraft[]>(
    (editing?.complaints ?? []).map((c) => ({
      guestName: c.guestName,
      mobile: c.mobile,
      email: c.email ?? "",
      complaintDetails: c.complaintDetails,
      serviceProviderName: c.serviceProviderName,
      responsiblePerson: c.responsiblePerson,
      actionTaken: c.actionTaken,
      solution: c.solution,
    }))
  );
  const [bpCpEntries, setBpCpEntries] = useState<BpCpDraft[]>(
    (editing?.bpCpEntries ?? []).map((e) => ({
      entryType: e.entryType,
      guestName: e.guestName,
      mobile: e.mobile,
      comment: e.comment ?? "",
    }))
  );

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const setComplaint = (index: number, field: keyof ComplaintDraft, value: string) => {
    setComplaints((list) => list.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const setBpCp = (index: number, field: keyof BpCpDraft, value: string) => {
    setBpCpEntries((list) => list.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const complaintPayload: GuestComplaintInput[] = complaints
      .filter((c) => c.guestName && c.mobile)
      .map((c) => ({
        guestName: c.guestName,
        mobile: c.mobile,
        email: c.email || null,
        complaintDetails: c.complaintDetails,
        serviceProviderName: c.serviceProviderName,
        responsiblePerson: c.responsiblePerson,
        actionTaken: c.actionTaken,
        solution: c.solution,
      }));

    const bpCpPayload: BpCpEntryInput[] = bpCpEntries
      .filter((e) => e.guestName && e.mobile)
      .map((e) => ({
        entryType: e.entryType,
        guestName: e.guestName,
        mobile: e.mobile,
        comment: e.comment || null,
      }));

    const base = {
      reportDate: form.reportDate,
      managerComments: form.managerComments,
      supplyPurchaseIssues: form.supplyPurchaseIssues,
      briefingPoints: form.briefingPoints,
      dailyLearnings: form.dailyLearnings,
      complaints: complaintPayload,
      bpCpEntries: bpCpPayload,
    };

    const result = editing
      ? await updateManagerReportAction(editing.id, { ...base, managerName: form.managerName })
      : await createManagerReportAction({ ...base, managerName: form.managerName, branchId: form.branchId });

    setSaving(false);
    if (result.success) {
      onSaved();
      onClose();
    } else {
      setError(result.error || "Failed to save report");
    }
  };

  const inputClass = "squircle-input w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-label font-bold text-ios-foreground">
              {editing ? "Edit Manager Report" : "New Manager Report"}
            </h2>
            <p className="text-caption text-ios-foreground-muted mt-0.5">
              {editing ? `Report #${editing.id}` : "Record today's operational details"}
            </p>
          </div>
          <Button variant="icon" size="sm" onClick={onClose} aria-label="Close" icon={X} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {!isManager && (
              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Branch</label>
                <select
                  value={form.branchId}
                  onChange={(e) => setField("branchId", Number(e.target.value))}
                  className={`${inputClass} appearance-none`}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} — {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-ios-foreground-muted">Manager Name</label>
              <input required value={form.managerName} onChange={(e) => setField("managerName", e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-ios-foreground-muted">Report Date</label>
              <input required type="date" value={form.reportDate} onChange={(e) => setField("reportDate", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-caption font-semibold text-ios-foreground-muted">Manager Comments</label>
            <textarea rows={2} value={form.managerComments} onChange={(e) => setField("managerComments", e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-caption font-semibold text-ios-foreground-muted">Supply / Purchase Issues</label>
            <textarea rows={2} value={form.supplyPurchaseIssues} onChange={(e) => setField("supplyPurchaseIssues", e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-caption font-semibold text-ios-foreground-muted">Briefing Points</label>
            <textarea rows={2} value={form.briefingPoints} onChange={(e) => setField("briefingPoints", e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-caption font-semibold text-ios-foreground-muted">Daily Learnings</label>
            <textarea rows={2} value={form.dailyLearnings} onChange={(e) => setField("dailyLearnings", e.target.value)} className={inputClass} />
          </div>

          <div className="rounded-2xl border border-ios-border-subtle p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-caption font-bold uppercase tracking-wider text-ios-foreground-subtle">Guest Complaints</h3>
              <Button variant="ghost" size="sm" icon={Plus} onClick={() => setComplaints((l) => [...l, emptyComplaint()])}>
                Add Complaint
              </Button>
            </div>
            {complaints.length === 0 && (
              <p className="text-caption text-ios-foreground-faint">No complaints recorded.</p>
            )}
            {complaints.map((c, i) => (
              <div key={i} className="space-y-2.5 rounded-xl bg-ios-border-subtle/20 p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input placeholder="Guest name" value={c.guestName} onChange={(e) => setComplaint(i, "guestName", e.target.value)} className="squircle-input w-full" />
                  <input placeholder="Mobile" value={c.mobile} onChange={(e) => setComplaint(i, "mobile", e.target.value)} className="squircle-input w-full" />
                </div>
                <input placeholder="Email (optional)" value={c.email} onChange={(e) => setComplaint(i, "email", e.target.value)} className="squircle-input w-full" />
                <textarea rows={2} placeholder="Complaint details" value={c.complaintDetails} onChange={(e) => setComplaint(i, "complaintDetails", e.target.value)} className="squircle-input w-full" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input placeholder="Service provider name" value={c.serviceProviderName} onChange={(e) => setComplaint(i, "serviceProviderName", e.target.value)} className="squircle-input w-full" />
                  <input placeholder="Responsible person" value={c.responsiblePerson} onChange={(e) => setComplaint(i, "responsiblePerson", e.target.value)} className="squircle-input w-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input placeholder="Action taken" value={c.actionTaken} onChange={(e) => setComplaint(i, "actionTaken", e.target.value)} className="squircle-input w-full" />
                  <input placeholder="Solution" value={c.solution} onChange={(e) => setComplaint(i, "solution", e.target.value)} className="squircle-input w-full" />
                </div>
                <div className="text-right">
                  <Button variant="ghost-red" size="sm" icon={Trash2} onClick={() => setComplaints((l) => l.filter((_, idx) => idx !== i))}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-ios-border-subtle p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-caption font-bold uppercase tracking-wider text-ios-foreground-subtle">BP / CP Entries</h3>
              <Button variant="ghost" size="sm" icon={Plus} onClick={() => setBpCpEntries((l) => [...l, emptyBpCp()])}>
                Add Entry
              </Button>
            </div>
            {bpCpEntries.length === 0 && (
              <p className="text-caption text-ios-foreground-faint">No BP / CP entries recorded.</p>
            )}
            {bpCpEntries.map((e, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[160px_1fr_1fr_auto] gap-2.5 rounded-xl bg-ios-border-subtle/20 p-3">
                <select value={e.entryType} onChange={(ev) => setBpCp(i, "entryType", ev.target.value as "TODAY" | "TOMORROW")} className="squircle-input w-full appearance-none">
                  <option value="TODAY">Today</option>
                  <option value="TOMORROW">Tomorrow</option>
                </select>
                <input placeholder="Guest name" value={e.guestName} onChange={(ev) => setBpCp(i, "guestName", ev.target.value)} className="squircle-input w-full" />
                <input placeholder="Mobile" value={e.mobile} onChange={(ev) => setBpCp(i, "mobile", ev.target.value)} className="squircle-input w-full" />
                <Button variant="icon" onClick={() => setBpCpEntries((l) => l.filter((_, idx) => idx !== i))} icon={Trash2} aria-label="Remove entry" />
              </div>
            ))}
            {bpCpEntries.length > 0 && (
              <input
                placeholder="Shared comment for all entries (optional)"
                value={bpCpEntries.find((e) => e.comment)?.comment ?? ""}
                onChange={(ev) => setBpCpEntries((l) => l.map((x) => ({ ...x, comment: ev.target.value })))}
                className="squircle-input w-full"
              />
            )}
          </div>

          {error && (
            <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-caption font-semibold">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button variant="primary" type="submit" loading={saving} className="flex-1">
              {editing ? "Save Changes" : "Create Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailPanel({ report, onClose }: { report: ManagerReportItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-label font-bold text-ios-foreground">Manager Report #{report.id}</h2>
            <p className="text-caption text-ios-foreground-muted mt-0.5">
              {report.branch?.name ?? `Branch #${report.branchId}`} · {report.reportDate}
            </p>
          </div>
          <Button variant="icon" size="sm" onClick={onClose} aria-label="Close" icon={X} />
        </div>

        <div className="space-y-4">
          <Section label="Manager" value={report.managerName} />
          <Section label="Manager Comments" value={report.managerComments} />
          <Section label="Supply / Purchase Issues" value={report.supplyPurchaseIssues} />
          <Section label="Briefing Points" value={report.briefingPoints} />
          <Section label="Daily Learnings" value={report.dailyLearnings} />

          <div>
            <h3 className="text-caption font-bold uppercase tracking-wider text-ios-foreground-subtle mb-2">
              Guest Complaints ({report.complaints?.length ?? 0})
            </h3>
            <div className="space-y-2">
              {(report.complaints ?? []).map((c) => (
                <div key={c.id} className="rounded-xl border border-ios-border-subtle p-3 space-y-1">
                  <p className="text-label font-semibold text-ios-foreground">{c.guestName}</p>
                  <p className="text-micro text-ios-foreground-subtle flex items-center gap-1"><Phone size={12} /> {c.mobile}</p>
                  <p className="text-caption text-ios-foreground-muted">{c.complaintDetails}</p>
                  <p className="text-micro text-ios-foreground-faint">
                    Provider: {c.serviceProviderName} · Responsible: {c.responsiblePerson}
                  </p>
                  <p className="text-micro text-ios-foreground-subtle">Action: {c.actionTaken} · Solution: {c.solution}</p>
                </div>
              ))}
              {(report.complaints ?? []).length === 0 && (
                <p className="text-caption text-ios-foreground-faint">No complaints recorded.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-caption font-bold uppercase tracking-wider text-ios-foreground-subtle mb-2">
              BP / CP Entries ({report.bpCpEntries?.length ?? 0})
            </h3>
            <div className="space-y-2">
              {(report.bpCpEntries ?? []).map((e) => (
                <div key={e.id} className="rounded-xl border border-ios-border-subtle p-3 flex items-center justify-between">
                  <div>
                    <p className="text-label font-semibold text-ios-foreground">{e.guestName}</p>
                    <p className="text-micro text-ios-foreground-subtle flex items-center gap-1"><Phone size={12} /> {e.mobile}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider bg-ios-primary/10 text-ios-primary">
                    <Clock size={12} /> {e.entryType === "TODAY" ? "Today" : "Tomorrow"}
                  </span>
                </div>
              ))}
              {(report.bpCpEntries ?? []).length === 0 && (
                <p className="text-caption text-ios-foreground-faint">No BP / CP entries recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="text-caption font-bold uppercase tracking-wider text-ios-foreground-subtle mb-1">{label}</h3>
      <p className="text-label text-ios-foreground-muted whitespace-pre-wrap">{value || "—"}</p>
    </div>
  );
}

export function ManagerReportClient() {
  const router = useRouter();
  const user = useDashboardUser();
  const isManager = user.role === "BRANCH_MANAGER";

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [data, setData] = useState<ManagerReportListResult>({ items: [], total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ managerName: "", startDate: "", endDate: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ManagerReportItem | null>(null);
  const [viewing, setViewing] = useState<ManagerReportItem | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    const result = await getManagerReports({ ...filters, page, limit: 15 });
    setData(result);
    setLoading(false);
  }, [filters, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    if (!isManager) {
      getBranchList().then(setBranches);
    }
  }, [isManager]);

  const handleDelete = async (report: ManagerReportItem) => {
    if (!confirm(`Delete manager report #${report.id}?`)) return;
    setDeleting(report.id);
    await deleteManagerReportAction(report.id);
    setDeleting(null);
    router.refresh();
    void load();
  };

  return (
    <>
      {showCreate && (
        <ReportForm branches={branches} editing={editing} onClose={() => { setShowCreate(false); setEditing(null); }} onSaved={() => void load()} />
      )}
      {viewing && <DetailPanel report={viewing} onClose={() => setViewing(null)} />}

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-ios-border-subtle flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ClipboardList size={15} className="text-ios-foreground-subtle" />
            <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Reports</span>
            <span className="text-micro font-medium text-ios-foreground-faint bg-ios-border-subtle/50 px-2 py-0.5 rounded-full">
              {data.total} total
            </span>
          </div>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => { setEditing(null); setShowCreate(true); }}>
            New Report
          </Button>
        </div>

        <div className="px-5 py-3 border-b border-ios-border-subtle grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <input
            placeholder="Manager name"
            value={filters.managerName}
            onChange={(e) => setFilters((f) => ({ ...f, managerName: e.target.value }))}
            className="squircle-input w-full"
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            className="squircle-input w-full"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            className="squircle-input w-full"
          />
          <Button variant="outline" size="sm" onClick={() => { setPage(1); void load(); }}>Apply Filters</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ios-border-subtle">
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Date</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Branch</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Manager</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Comments</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Complaints</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">BP/CP</th>
                <th className="text-right px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <p className="text-caption text-ios-foreground-subtle font-medium">Loading reports…</p>
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <ClipboardList size={32} className="text-ios-foreground-faint" />
                      <p className="text-label font-semibold text-ios-foreground-subtle">No reports found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((report) => (
                  <tr key={report.id} className="border-b border-ios-border-subtle last:border-0 hover:bg-ios-border-subtle/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="text-label font-semibold text-ios-foreground">{report.reportDate}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-label text-ios-foreground-muted">{report.branch?.name ?? `Branch #${report.branchId}`}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-label text-ios-foreground-muted">{report.managerName}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-caption text-ios-foreground-subtle line-clamp-1 max-w-[220px] block">
                        {report.managerComments || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-caption text-ios-foreground-subtle">{report.complaints?.length ?? 0}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-caption text-ios-foreground-subtle">{report.bpCpEntries?.length ?? 0}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="icon" onClick={() => setViewing(report)} title="View report" icon={Eye} />
                        <Button variant="icon" onClick={() => { setEditing(report); setShowCreate(true); }} title="Edit report" icon={Pencil} />
                        <Button
                          variant="ghost-red"
                          onClick={() => handleDelete(report)}
                          disabled={deleting === report.id}
                          loading={deleting === report.id}
                          icon={Trash2}
                          title="Delete report"
                        />
                      </div>
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
