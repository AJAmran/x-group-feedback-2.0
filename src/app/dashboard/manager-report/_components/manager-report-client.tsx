"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useDashboardUser } from "../../dashboard-context";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ClipboardList,
  Phone,
  Clock,
  Check,
  X,
  Inbox,
  FileCheck2,
  ShieldCheck,
  FileText,
  UserRound,
  MessageCircleWarning,
  ListTodo,
  Search,
  RotateCcw,
  Send,
  Building2,
  Printer,
  MessageSquare,
  PackageOpen,
  Megaphone,
  Lightbulb,
  StickyNote,
  type LucideIcon,
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
import { DateRangeFilter, FilterChip, FILTER_INPUT_CLASS, FILTER_SELECT_CLASS } from "@/components/dashboard/filters";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge as StatusBadgeShared } from "@/components/dashboard/status-badge";
import { OpsStatCard } from "@/components/dashboard/ops-stat-card";
import { StatsGridSkeleton } from "@/app/_components/skeleton";
import { isAdminRole } from "@/lib/roles";
import { getBranchList } from "@/features/dashboard/actions";
import {
  getManagerReports,
  getManagerReportDetail,
  getManagerReportSummary,
  createManagerReportAction,
  updateManagerReportAction,
  deleteManagerReportAction,
  setManagerReportApprovalAction,
  getManagerReportComments,
  addManagerReportComment,
} from "@/features/manager-report/actions";
import type {
  ManagerReportItem,
  ManagerReportListResult,
  ManagerReportSummary,
  ManagerReportCommentItem,
  GuestComplaintInput,
  BpCpEntryInput,
  ApprovalStatus,
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
  totalPax: string;
  comment: string;
}

interface ReportFilters {
  managerName: string;
  startDate: string;
  endDate: string;
  approvalStatus: ApprovalStatus | "";
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const STATUS_VARIANT: Record<ApprovalStatus, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  PENDING: "অপেক্ষমাণ",
  APPROVED: "অনুমোদিত",
  REJECTED: "বাতিল",
};

function StatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <StatusBadgeShared variant={STATUS_VARIANT[status]}>
      {status === "PENDING" ? <Clock size={12} /> : status === "APPROVED" ? <Check size={12} /> : <X size={12} />}
      {STATUS_LABEL[status]}
    </StatusBadgeShared>
  );
}

function ReportDate({ date }: { date: string }) {
  const d = new Date(`${date}T00:00:00`);
  const rel = date === today() ? "Today" : date === yesterday() ? "Yesterday" : null;
  return (
    <div>
      <p className="text-caption font-bold text-ios-foreground whitespace-nowrap">{format(d, "dd MMM yyyy")}</p>
      {rel ? (
        <p className="text-micro font-bold text-ios-primary mt-0.5">{rel}</p>
      ) : (
        <p className="text-micro text-ios-foreground-faint mt-0.5 capitalize">{format(d, "EEEE")}</p>
      )}
    </div>
  );
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
  totalPax: "",
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
      totalPax: e.totalPax?.toString() ?? "",
      comment: "",
    }))
  );
  const [sharedBpCpComment, setSharedBpCpComment] = useState(
    editing?.bpCpEntries?.[0]?.comment ?? ""
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
    if (saving) return;
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
        totalPax: e.totalPax ? Number(e.totalPax) : null,
        comment: sharedBpCpComment || null,
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

  const dateBounds = isManager ? { min: yesterday(), max: today() } : {};

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={editing ? "রিপোর্ট সম্পাদনা করুন" : "নতুন রিপোর্ট"}
      description={editing ? `রিপোর্ট #${editing.id}` : "আজকের কার্যক্রমের তথ্য লিখুন"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!isManager && (
            <FormField label="শাখা" hint="Branch">
              <SelectInput
                value={String(form.branchId)}
                onChange={(e) => setField("branchId", Number(e.target.value))}
                options={branches.map((b) => ({ value: b.id, label: `${b.code} — ${b.name}` }))}
              />
            </FormField>
          )}
          <FormField label="ব্যবস্থাপকের নাম" hint="Manager Name" required>
            <TextInput
              required
              value={form.managerName}
              onChange={(e) => setField("managerName", e.target.value)}
            />
          </FormField>
          <FormField label="রিপোর্টের তারিখ" hint="Report Date" required>
            <TextInput
              required
              type="date"
              {...dateBounds}
              value={form.reportDate}
              onChange={(e) => setField("reportDate", e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="ব্যবস্থাপকের মন্তব্য" hint="Manager Comments">
          <TextAreaInput
            rows={2}
            value={form.managerComments}
            onChange={(e) => setField("managerComments", e.target.value)}
          />
        </FormField>
        <FormField label="সরবরাহ / ক্রয় সমস্যা" hint="Supply / Purchase Issues">
          <TextAreaInput
            rows={2}
            value={form.supplyPurchaseIssues}
            onChange={(e) => setField("supplyPurchaseIssues", e.target.value)}
          />
        </FormField>
        <FormField label="ব্রিফিং পয়েন্ট" hint="Briefing Points">
          <TextAreaInput
            rows={2}
            value={form.briefingPoints}
            onChange={(e) => setField("briefingPoints", e.target.value)}
          />
        </FormField>
        <FormField label="দৈনিক শিক্ষণীয়" hint="Daily Learnings">
          <TextAreaInput
            rows={2}
            value={form.dailyLearnings}
            onChange={(e) => setField("dailyLearnings", e.target.value)}
          />
        </FormField>

        <div className="rounded-2xl border border-ios-border-subtle p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-caption font-bold uppercase tracking-wider text-ios-foreground-subtle">
              অতিথির অভিযোগ <span className="normal-case font-semibold text-ios-foreground-faint">(Guest Complaints)</span>
            </h3>
            <Button variant="ghost" size="sm" type="button" icon={Plus} disabled={saving} onClick={() => setComplaints((l) => [...l, emptyComplaint()])}>
              অভিযোগ যোগ করুন
            </Button>
          </div>
          {complaints.length === 0 && (
            <p className="text-caption text-ios-foreground-faint">কোনো অভিযোগ রেকর্ড করা হয়নি।</p>
          )}
          {complaints.map((c, i) => (
            <div key={i} className="space-y-2.5 rounded-xl bg-ios-border-subtle/20 p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <TextInput placeholder="অতিথির নাম" value={c.guestName} onChange={(e) => setComplaint(i, "guestName", e.target.value)} />
                <TextInput placeholder="মোবাইল নম্বর" value={c.mobile} onChange={(e) => setComplaint(i, "mobile", e.target.value)} />
              </div>
              <TextInput placeholder="ইমেইল (ঐচ্ছিক)" value={c.email} onChange={(e) => setComplaint(i, "email", e.target.value)} />
              <TextAreaInput rows={2} placeholder="অভিযোগের বিবরণ" value={c.complaintDetails} onChange={(e) => setComplaint(i, "complaintDetails", e.target.value)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <TextInput placeholder="পরিষেবা প্রদানকারীর নাম (ঐচ্ছিক)" value={c.serviceProviderName} onChange={(e) => setComplaint(i, "serviceProviderName", e.target.value)} />
                <TextInput placeholder="দায়িত্বপ্রাপ্ত ব্যক্তি (ঐচ্ছিক)" value={c.responsiblePerson} onChange={(e) => setComplaint(i, "responsiblePerson", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <TextInput placeholder="গৃহীত ব্যবস্থা" value={c.actionTaken} onChange={(e) => setComplaint(i, "actionTaken", e.target.value)} />
                <TextInput placeholder="সমাধান" value={c.solution} onChange={(e) => setComplaint(i, "solution", e.target.value)} />
              </div>
              <div className="text-right">
                <Button variant="ghost-red" size="sm" type="button" icon={Trash2} disabled={saving} onClick={() => setComplaints((l) => l.filter((_, idx) => idx !== i))}>
                  সরান
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-ios-border-subtle p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-caption font-bold uppercase tracking-wider text-ios-foreground-subtle">
              BP / CP এন্ট্রি <span className="normal-case font-semibold text-ios-foreground-faint">(BP / CP Entries)</span>
            </h3>
            <Button variant="ghost" size="sm" type="button" icon={Plus} disabled={saving} onClick={() => setBpCpEntries((l) => [...l, emptyBpCp()])}>
              এন্ট্রি যোগ করুন
            </Button>
          </div>
          {bpCpEntries.length === 0 && (
            <p className="text-caption text-ios-foreground-faint">কোনো BP / CP এন্ট্রি রেকর্ড করা হয়নি।</p>
          )}
          {bpCpEntries.map((e, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[160px_1fr_1fr_90px_auto] gap-2.5 rounded-xl bg-ios-border-subtle/20 p-3">
              <SelectInput
                value={e.entryType}
                onChange={(ev) => setBpCp(i, "entryType", ev.target.value as "TODAY" | "TOMORROW")}
                options={[
                  { value: "TODAY", label: "আজ" },
                  { value: "TOMORROW", label: "আগামীকাল" },
                ]}
              />
              <TextInput placeholder="অতিথির নাম" value={e.guestName} onChange={(ev) => setBpCp(i, "guestName", ev.target.value)} />
              <TextInput placeholder="মোবাইল নম্বর" value={e.mobile} onChange={(ev) => setBpCp(i, "mobile", ev.target.value)} />
              <TextInput
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="মোট PAX"
                aria-label="Total PAX"
                value={e.totalPax}
                onChange={(ev) => setBpCp(i, "totalPax", ev.target.value)}
              />
              <Button variant="icon" type="button" disabled={saving} onClick={() => setBpCpEntries((l) => l.filter((_, idx) => idx !== i))} icon={Trash2} aria-label="Remove entry" />
            </div>
          ))}
          {bpCpEntries.length > 0 && (
            <TextInput
              placeholder="সব এন্ট্রির জন্য সাধারণ মন্তব্য (ঐচ্ছিক)"
              value={sharedBpCpComment}
              onChange={(ev) => setSharedBpCpComment(ev.target.value)}
            />
          )}
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={saving} className="flex-1">বাতিল</Button>
          <Button variant="primary" type="submit" loading={saving} className="flex-1">
            {editing ? "পরিবর্তন সংরক্ষণ করুন" : "রিপোর্ট তৈরি করুন"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-caption text-ios-foreground-faint">{text}</p>;
}

function TextView({ value }: { value?: string | null }) {
  if (!value?.trim()) return <EmptyHint text="No information provided" />;
  return (
    <p className="text-caption text-ios-foreground-muted whitespace-pre-wrap wrap-break-word leading-relaxed">
      {value}
    </p>
  );
}

function DocSection({
  index,
  icon: Icon,
  title,
  hint,
  count,
  children,
}: {
  index: string;
  icon: LucideIcon;
  title: string;
  hint?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="print:break-inside-avoid">
      <div className="flex items-center gap-3 py-4">
        <span className="w-8 h-8 rounded-lg bg-ios-primary/[0.07] border border-ios-primary/10 text-ios-primary flex items-center justify-center shrink-0">
          <Icon size={15} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h4 className="text-label font-bold text-ios-foreground">
            <span className="text-ios-primary tabular-nums mr-2">{index}</span>
            {title}
          </h4>
          {hint && <p className="text-micro text-ios-foreground-faint mt-0.5">{hint}</p>}
        </div>
        {count !== undefined && (
          <span className="ml-auto text-micro font-bold bg-ios-border-subtle/60 text-ios-foreground-subtle px-2 py-0.5 rounded-full shrink-0">
            {count}
          </span>
        )}
      </div>
      <div className="pl-10 pb-5">{children}</div>
      <div className="h-px bg-ios-border-subtle/70" aria-hidden="true" />
    </section>
  );
}

function MetaStrip({
  managerName,
  branch,
  complaintCount,
  bookingCount,
}: {
  managerName: string;
  branch?: { name?: string; code?: string | null } | null;
  complaintCount: number;
  bookingCount: number;
}) {
  const cells = [
    { icon: UserRound, label: "Prepared by", value: managerName || "—", sub: null as string | null },
    { icon: Building2, label: "Branch", value: branch?.name ?? "—", sub: branch?.code ?? null },
    { icon: MessageCircleWarning, label: "Guest complaints", value: String(complaintCount), sub: null },
    { icon: ListTodo, label: "Expected guests", value: String(bookingCount), sub: null },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-ios-border-subtle bg-surface-100/50 divide-y sm:divide-y-0 sm:divide-x divide-ios-border-subtle overflow-hidden">
      {cells.map((c) => (
        <div key={c.label} className="flex items-center gap-3 px-4 py-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-ios-primary/[0.07] border border-ios-primary/10 text-ios-primary flex items-center justify-center shrink-0">
            <c.icon size={14} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-micro font-semibold text-ios-foreground-faint">{c.label}</p>
            <p className="text-label font-bold text-ios-foreground truncate">
              {c.value}
              {c.sub && (
                <span className="ml-1.5 text-micro font-semibold text-ios-foreground-faint">· {c.sub}</span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ApprovalStrip({
  status,
  approvedAt,
  approvedBy,
  approvalComment,
  isAdmin,
  onApprove,
  onReject,
}: {
  status: ApprovalStatus;
  approvedAt?: string | null;
  approvedBy?: { name?: string } | null;
  approvalComment?: string | null;
  isAdmin: boolean;
  onApprove: () => Promise<boolean>;
  onReject: (comment: string) => Promise<boolean>;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    const ok = await onApprove();
    if (!ok) setError("অনুমোদন ব্যর্থ হয়েছে।");
    setSaving(false);
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!comment.trim()) {
      setError("বাতিলের কারণ লিখুন।");
      return;
    }
    setSaving(true);
    setError("");
    const ok = await onReject(comment.trim());
    if (!ok) setError("বাতিল ব্যর্থ হয়েছে।");
    setSaving(false);
  };

  const approvedAtText = approvedAt ? format(new Date(approvedAt), "dd MMM yyyy, h:mm a") : "";
  const approvedByName = approvedBy?.name ?? "System Administrator";

  if (status === "APPROVED") {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-3 flex items-center gap-3 print:break-inside-avoid">
        <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-label font-bold text-emerald-700 dark:text-emerald-400">Approved</p>
          <p className="text-caption text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">
            by {approvedByName}
            {approvedAtText ? ` · ${approvedAtText}` : ""}
          </p>
          {approvalComment && (
            <p className="text-caption text-emerald-700/80 dark:text-emerald-400/80 mt-1.5 whitespace-pre-wrap wrap-break-word">
              {approvalComment}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 flex items-center gap-3 print:break-inside-avoid">
        <div className="w-9 h-9 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
          <X size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-label font-bold text-red-700 dark:text-red-400">Rejected</p>
          <p className="text-caption text-red-700/70 dark:text-red-400/70 mt-0.5">
            by {approvedByName}
            {approvedAtText ? ` · ${approvedAtText}` : ""}
          </p>
          {approvalComment && (
            <p className="text-caption text-red-700/80 dark:text-red-400/80 mt-1.5 whitespace-pre-wrap wrap-break-word">
              {approvalComment}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3 flex flex-wrap items-center justify-between gap-3 print:break-inside-avoid">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Clock size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-label font-bold text-amber-700 dark:text-amber-400">Pending approval</p>
          <p className="text-caption text-amber-700/70 dark:text-amber-400/70 mt-0.5">
            {isAdmin ? "Approve this report or provide feedback to reject it." : "This report is awaiting admin approval."}
          </p>
        </div>
      </div>
      {isAdmin && (
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost-red" size="sm" icon={X} disabled={saving} onClick={() => setRejecting(true)}>
            Reject
          </Button>
          <Button variant="primary" size="sm" icon={Check} loading={saving && !rejecting} onClick={handleApprove}>
            Approve
          </Button>
        </div>
      )}

      {isAdmin && rejecting && (
        <form onSubmit={handleReject} className="w-full mt-1 pt-3 border-t border-amber-500/20 space-y-2">
          <TextAreaInput
            rows={2}
            autoFocus
            placeholder="বাতিলের কারণ লিখুন…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" type="button" disabled={saving} onClick={() => setRejecting(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit" icon={X} loading={saving}>
              Confirm Rejection
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function ComplaintList({ complaints }: { complaints: Array<GuestComplaintInput & { id: number }> }) {
  if (complaints.length === 0) {
    return <EmptyHint text="No complaints recorded" />;
  }

  return (
    <div className="space-y-2.5">
      {complaints.map((c, i) => (
        <div key={c.id} className="rounded-xl border border-ios-border-subtle bg-surface-100/60 p-3.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-full bg-ios-primary/9 border border-ios-primary/15 text-ios-primary text-micro font-bold flex items-center justify-center shrink-0">
                {initials(c.guestName)}
              </span>
              <div className="min-w-0">
                <p className="text-label font-semibold text-ios-foreground truncate">{c.guestName}</p>
                <p className="text-micro text-ios-foreground-subtle flex items-center gap-1">
                  <Phone size={10} /> {c.mobile}
                </p>
              </div>
            </div>
            <span className="text-micro font-bold text-ios-foreground-faint tabular-nums">#{i + 1}</span>
          </div>

          {c.complaintDetails && (
            <p className="text-caption text-ios-foreground-muted mt-2.5 whitespace-pre-wrap wrap-break-word leading-relaxed">
              {c.complaintDetails}
            </p>
          )}

          {(c.serviceProviderName || c.responsiblePerson) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {c.serviceProviderName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-ios-border-subtle/60 text-micro font-semibold text-ios-foreground-subtle">
                  Provider: {c.serviceProviderName}
                </span>
              )}
              {c.responsiblePerson && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-ios-border-subtle/60 text-micro font-semibold text-ios-foreground-subtle">
                  Responsible: {c.responsiblePerson}
                </span>
              )}
            </div>
          )}

          {(c.actionTaken || c.solution) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 mt-3 pt-3 border-t border-ios-border-subtle/60">
              {c.actionTaken && (
                <div>
                  <p className="text-micro font-bold text-ios-foreground-faint uppercase tracking-wide">Action taken</p>
                  <p className="text-caption text-ios-foreground-muted mt-0.5 whitespace-pre-wrap wrap-break-word">{c.actionTaken}</p>
                </div>
              )}
              {c.solution && (
                <div>
                  <p className="text-micro font-bold text-ios-foreground-faint uppercase tracking-wide">Solution</p>
                  <p className="text-caption text-ios-foreground-muted mt-0.5 whitespace-pre-wrap wrap-break-word">{c.solution}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BookingsSection({ entries }: { entries: Array<BpCpEntryInput & { id: number }> }) {
  const groups = [
    { key: "TODAY" as const, label: "আজ", en: "Today", list: entries.filter((e) => e.entryType === "TODAY") },
    { key: "TOMORROW" as const, label: "আগামীকাল", en: "Tomorrow", list: entries.filter((e) => e.entryType === "TOMORROW") },
  ];

  if (entries.length === 0) {
    return <EmptyHint text="No expected guests" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {groups.map((g) => (
        <div key={g.key} className="rounded-xl border border-ios-border-subtle bg-surface-200/60 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-ios-border-subtle flex items-center justify-between gap-2">
            <p className="text-caption font-bold text-ios-foreground flex items-center gap-1.5">
              <Clock size={13} className="text-ios-primary" /> {g.label}
              <span className="text-micro font-semibold text-ios-foreground-faint">/ {g.en}</span>
            </p>
            <span className="text-micro font-bold bg-ios-primary/10 text-ios-primary px-2 py-0.5 rounded-full">{g.list.length}</span>
            {(() => {
              const total = g.list.reduce((sum, e) => sum + (e.totalPax ?? 0), 0);
              return total > 0 ? (
                <span className="text-micro font-bold bg-ios-primary/10 text-ios-primary px-2 py-0.5 rounded-full">{total} PAX</span>
              ) : null;
            })()}
          </div>
          <div className="p-3 space-y-2">
            {g.list.length === 0 && <EmptyHint text="No expected guests" />}
            {g.list.map((e) => (
              <div key={e.id} className="rounded-lg border border-ios-border-subtle bg-surface-100 p-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-ios-primary/9 border border-ios-primary/15 text-ios-primary text-micro font-bold flex items-center justify-center shrink-0">
                    {initials(e.guestName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-label font-semibold text-ios-foreground truncate">{e.guestName}</p>
                    <p className="text-micro text-ios-foreground-subtle flex items-center gap-1">
                      <Phone size={10} /> {e.mobile}
                    </p>
                  </div>
                  {e.totalPax ? (
                    <span className="text-micro font-bold bg-ios-primary/10 text-ios-primary px-2 py-0.5 rounded-full shrink-0">
                      {e.totalPax} PAX
                    </span>
                  ) : null}
                </div>
                {e.comment && (
                  <p className="text-micro text-ios-foreground-subtle mt-2 pt-2 border-t border-ios-border-subtle/60 whitespace-pre-wrap wrap-break-word">
                    {e.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentTimeline({
  comments,
  isAdmin,
  newComment,
  setNewComment,
  saving,
  error,
  onAdd,
}: {
  comments: ManagerReportCommentItem[];
  isAdmin: boolean;
  newComment: string;
  setNewComment: (v: string) => void;
  saving: boolean;
  error: string;
  onAdd: () => void;
}) {
  return (
    <div>
      {comments.length === 0 ? (
        <EmptyHint text="No admin notes yet" />
      ) : (
        <div className="space-y-3">
          {comments.map((c, i) => (
            <div key={c.id} className="flex gap-2.5">
              <span className="w-7 h-7 rounded-full bg-ios-primary/9 border border-ios-primary/15 text-ios-primary text-micro font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                {initials(c.user?.name ?? "A")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-label font-bold text-ios-foreground">{c.user?.name ?? "Admin"}</p>
                  <p className="text-micro text-ios-foreground-faint tabular-nums">
                    {c.createdAt ? format(new Date(c.createdAt), "dd MMM yyyy, h:mm a") : ""}
                  </p>
                </div>
                <p className="text-caption text-ios-foreground-muted mt-0.5 whitespace-pre-wrap wrap-break-word leading-relaxed">
                  {c.comment}
                </p>
                {i < comments.length - 1 && <div className="h-px bg-ios-border-subtle/60 mt-3" aria-hidden="true" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="mt-4 rounded-xl border border-ios-border-subtle bg-surface-200/60 p-3">
          <div className="space-y-2">
            <TextAreaInput
              rows={2}
              placeholder="প্রশাসকের মন্তব্য লিখুন…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                loading={saving}
                disabled={!newComment.trim()}
                onClick={onAdd}
              >
                মন্তব্য যোগ করুন
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailPanel({
  report,
  onClose,
  onStatusChanged,
}: {
  report: ManagerReportItem;
  onClose: () => void;
  onStatusChanged?: () => void;
}) {
  const user = useDashboardUser();
  const isAdmin = isAdminRole(user.role);
  const [detail, setDetail] = useState<ManagerReportItem | null>(report);
  const [comments, setComments] = useState<ManagerReportCommentItem[]>(report.comments ?? []);
  const [newComment, setNewComment] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getManagerReportDetail(report.id).then((d) => {
      if (!cancelled && d) setDetail(d);
    });
    getManagerReportComments(report.id).then((list) => {
      if (!cancelled) setComments(list);
    });
    return () => {
      cancelled = true;
    };
  }, [report.id]);

  const data = detail ?? report;
  const status = data.approvalStatus ?? "PENDING";
  const reportDate = data.reportDate ? format(new Date(`${data.reportDate}T00:00:00`), "EEEE, dd MMM yyyy") : "—";

  const handleApprove = async () => {
    const result = await setManagerReportApprovalAction(report.id, "APPROVED");
    if (result.success) {
      const d = await getManagerReportDetail(report.id);
      if (d) setDetail(d);
      onStatusChanged?.();
      return true;
    }
    return false;
  };

  const handleReject = async (comment: string) => {
    const result = await setManagerReportApprovalAction(report.id, "REJECTED", comment);
    if (result.success) {
      const d = await getManagerReportDetail(report.id);
      if (d) setDetail(d);
      onStatusChanged?.();
      return true;
    }
    return false;
  };

  const handleAddComment = async () => {
    const text = newComment.trim();
    if (!text || commentSaving) return;
    setCommentSaving(true);
    setCommentError("");
    const result = await addManagerReportComment(report.id, text);
    setCommentSaving(false);
    if (result.success && result.comment) {
      setComments((prev) => [...prev, result.comment!]);
      setNewComment("");
    } else {
      setCommentError(result.error || "Failed to add comment");
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      className="print:!p-8"
      header={
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-ios-primary/10 border border-ios-primary/15 flex items-center justify-center shrink-0">
            <FileText size={22} className="text-ios-primary" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2 className="text-body font-bold text-ios-foreground leading-tight">Daily Manager Report</h2>
            <p className="text-caption text-ios-foreground-muted mt-0.5 truncate">
              Report #{data.id} · {reportDate}
            </p>
          </div>
        </div>
      }
      headerExtra={
        <Button variant="ghost" size="sm" icon={Printer} onClick={() => window.print()}>
          Print
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="hidden print:block mb-6">
          <div className="flex items-center justify-between border-b-2 border-ios-foreground pb-3">
            <div>
              <h2 className="text-body font-extrabold text-ios-foreground">X-Group Hospitality</h2>
              <p className="text-micro font-semibold text-ios-foreground-subtle mt-0.5">Daily Manager Report</p>
            </div>
            <div className="text-right">
              <p className="text-label font-bold text-ios-foreground">Report #{data.id}</p>
              <p className="text-caption text-ios-foreground-subtle mt-0.5">{reportDate}</p>
            </div>
          </div>
        </div>

        <ApprovalStrip
          status={status}
          approvedAt={data.approvedAt}
          approvedBy={data.approvedBy}
          approvalComment={data.approvalComment}
          isAdmin={isAdmin}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        <MetaStrip
          managerName={data.managerName}
          branch={data.branch}
          complaintCount={data.complaints?.length ?? 0}
          bookingCount={data.bpCpEntries?.length ?? 0}
        />

        <div>
          <DocSection index="01" icon={MessageSquare} title="ব্যবস্থাপকের মন্তব্য" hint="Manager Comments">
            <TextView value={data.managerComments} />
          </DocSection>

          <DocSection index="02" icon={PackageOpen} title="সরবরাহ / ক্রয় সমস্যা" hint="Supply & Purchase Issues">
            <TextView value={data.supplyPurchaseIssues} />
          </DocSection>

          <DocSection index="03" icon={Megaphone} title="ব্রিফিং পয়েন্ট" hint="Briefing Points">
            <TextView value={data.briefingPoints} />
          </DocSection>

          <DocSection index="04" icon={Lightbulb} title="দৈনিক শিক্ষণীয়" hint="Daily Learnings">
            <TextView value={data.dailyLearnings} />
          </DocSection>

          <DocSection
            index="05"
            icon={MessageCircleWarning}
            title="অতিরিক্ত অভিযোগ"
            hint="Guest Complaints"
            count={data.complaints?.length ?? 0}
          >
            <ComplaintList complaints={data.complaints ?? []} />
          </DocSection>

          <DocSection
            index="06"
            icon={ListTodo}
            title="প্রত্যাশিত অতিথি"
            hint="Expected Guests / Bookings"
            count={data.bpCpEntries?.length ?? 0}
          >
            <BookingsSection entries={data.bpCpEntries ?? []} />
          </DocSection>

          <DocSection index="07" icon={StickyNote} title="প্রশাসকের মন্তব্য" hint="Admin Notes" count={comments.length}>
            <CommentTimeline
              comments={comments}
              isAdmin={isAdmin}
              newComment={newComment}
              setNewComment={setNewComment}
              saving={commentSaving}
              error={commentError}
              onAdd={handleAddComment}
            />
          </DocSection>
        </div>
      </div>
    </Modal>
  );
}

export function ManagerReportClient() {
  const router = useRouter();
  const user = useDashboardUser();
  const isAdmin = isAdminRole(user.role);

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [data, setData] = useState<ManagerReportListResult>({ items: [], total: 0, page: 1, totalPages: 0 });
  const [summary, setSummary] = useState<ManagerReportSummary>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ReportFilters>({ managerName: "", startDate: "", endDate: "", approvalStatus: "" });
  const [applied, setApplied] = useState<ReportFilters>(filters);
  const debouncedName = useDebouncedValue(filters.managerName, 350);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ManagerReportItem | null>(null);
  const [viewing, setViewing] = useState<ManagerReportItem | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ManagerReportItem | null>(null);
  const [approving, setApproving] = useState<{ id: number; status: "APPROVED" | "REJECTED" } | null>(null);
  const [cancelling, setCancelling] = useState<ManagerReportItem | null>(null);
  const [cancelComment, setCancelComment] = useState("");
  const [cancelSaving, setCancelSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    const result = await getManagerReports({
      managerName: debouncedName || undefined,
      startDate: applied.startDate || undefined,
      endDate: applied.endDate || undefined,
      approvalStatus: applied.approvalStatus || undefined,
      page,
      limit: 15,
    });
    setData(result);
    setLoading(false);
  }, [applied, debouncedName, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    getManagerReportSummary().then(setSummary);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      getBranchList().then(setBranches);
    }
  }, [isAdmin]);

  const refresh = useCallback(() => {
    router.refresh();
    void load();
    void getManagerReportSummary().then(setSummary);
  }, [router, load]);

  const handleApprove = async (id: number, status: "APPROVED" | "REJECTED") => {
    if (approving != null) return;
    setActionError("");
    setApproving({ id, status });
    const result = await setManagerReportApprovalAction(id, status);
    setApproving(null);
    if (result.success) {
      refresh();
    } else {
      setActionError(result.error || "Failed to update approval");
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelling || cancelSaving) return;
    if (approving != null) return;
    setCancelSaving(true);
    setActionError("");
    const result = await setManagerReportApprovalAction(cancelling.id, "REJECTED", cancelComment.trim() || undefined);
    setCancelSaving(false);
    if (result.success) {
      setCancelling(null);
      setCancelComment("");
      refresh();
    } else {
      setActionError(result.error || "Failed to update approval");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    if (deleting != null) return;
    setDeleting(confirmDelete.id);
    const result = await deleteManagerReportAction(confirmDelete.id);
    setDeleting(null);
    setConfirmDelete(null);
    if (result.success) {
      refresh();
    } else {
      setActionError(result.error || "Failed to delete report");
    }
  };

  const applyFilters = () => {
    setPage(1);
    setApplied(filters);
  };

  const clearFilter = (key: keyof ReportFilters) => {
    const cleared = { ...applied, [key]: "" } as ReportFilters;
    setPage(1);
    setApplied(cleared);
    setFilters(cleared);
  };

  const resetFilters = () => {
    const empty: ReportFilters = { managerName: "", startDate: "", endDate: "", approvalStatus: "" };
    setPage(1);
    setApplied(empty);
    setFilters(empty);
  };

  const reviewPending = () => {
    const next: ReportFilters = { managerName: "", startDate: "", endDate: "", approvalStatus: "PENDING" };
    setPage(1);
    setApplied(next);
    setFilters(next);
  };

  const hasFilters =
    applied.managerName !== "" ||
    applied.startDate !== "" ||
    applied.endDate !== "" ||
    applied.approvalStatus !== "";

  return (
    <>
      {showCreate && (
        <ReportForm
          branches={branches}
          editing={editing}
          onClose={() => {
            setShowCreate(false);
            setEditing(null);
          }}
          onSaved={refresh}
        />
      )}
      {viewing && (
        <DetailPanel
          report={viewing}
          onClose={() => setViewing(null)}
          onStatusChanged={refresh}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting != null}
        title="রিপোর্ট মুছুন"
        message={
          <>
            আপনি কি নিশ্চিতভাবে রিপোর্ট{" "}
            <span className="font-bold text-ios-foreground">#{confirmDelete?.id}</span> মুছতে চান?
            এই কাজটি ফেরানো যাবে না।
          </>
        }
        confirmLabel="মুছুন"
        cancelLabel="বাতিল"
      />

      {cancelling && (
        <Modal
          open
          onClose={() => {
            if (!cancelSaving) {
              setCancelling(null);
              setCancelComment("");
            }
          }}
          title="রিপোর্ট বাতিল করুন"
          description={`রিপোর্ট #${cancelling.id} · ${cancelling.managerName}`}
          size="sm"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleCancelConfirm();
            }}
            className="space-y-4"
          >
            <FormField label="বাতিলের কারণ" hint="Cancellation Comment">
              <TextAreaInput
                rows={3}
                placeholder="কেন এই রিপোর্টটি বাতিল করা হচ্ছে?"
                value={cancelComment}
                onChange={(e) => setCancelComment(e.target.value)}
              />
            </FormField>
            <div className="flex gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setCancelling(null);
                  setCancelComment("");
                }}
                disabled={cancelSaving}
                className="flex-1"
              >
                না, রাখুন
              </Button>
              <Button variant="danger" type="submit" icon={X} loading={cancelSaving} className="flex-1">
                হ্যাঁ, বাতিল করুন
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {loading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <OpsStatCard icon={Inbox} label="মোট রিপোর্ট" value={summary.total} tone="primary" subtext="All recorded reports" />
          <OpsStatCard icon={Clock} label="অপেক্ষমাণ" value={summary.pending} tone="amber" subtext={summary.pending > 0 ? "Awaiting approval" : "All reviewed"} />
          <OpsStatCard icon={FileCheck2} label="অনুমোদিত" value={summary.approved} tone="green" subtext="Approved reports" />
          <OpsStatCard icon={X} label="বাতিল" value={summary.rejected} tone="red" subtext="Rejected reports" />
        </div>
      )}

      {isAdmin && summary.pending > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/12 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-label font-bold text-amber-700 dark:text-amber-400">
              {summary.pending}টি রিপোর্ট অনুমোদনের অপেক্ষায়
            </p>
            <p className="text-caption text-amber-700/70 dark:text-amber-400/70 mt-0.5">
              Review the pending daily reports to keep the workflow moving.
            </p>
          </div>
          <Button variant="ghost-green" size="sm" icon={Check} onClick={reviewPending}>
            Review pending
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-ios-border-subtle bg-surface-300 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-ios-border-subtle flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-ios-primary/9 border border-ios-primary/10 text-ios-primary flex items-center justify-center shrink-0">
              <ClipboardList size={15} strokeWidth={2} />
            </div>
            <h2 className="text-label font-bold text-ios-foreground">রিপোর্ট তালিকা</h2>
            <span className="text-micro font-semibold bg-ios-primary/10 text-ios-primary px-2 py-0.5 rounded-full shrink-0">
              {data.total}
            </span>
          </div>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => { setEditing(null); setShowCreate(true); }}>
            নতুন রিপোর্ট
          </Button>
        </div>

        <div className="px-5 py-4 border-b border-ios-border-subtle space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-foreground-faint pointer-events-none" />
              <TextInput
                className={`${FILTER_INPUT_CLASS} pl-9!`}
                placeholder="ব্যবস্থাপকের নাম…"
                value={filters.managerName}
                onChange={(e) => setFilters((f) => ({ ...f, managerName: e.target.value }))}
              />
            </div>
            <DateRangeFilter
              start={filters.startDate}
              end={filters.endDate}
              onStartChange={(v) => setFilters((f) => ({ ...f, startDate: v }))}
              onEndChange={(v) => setFilters((f) => ({ ...f, endDate: v }))}
            />
            {isAdmin && (
              <SelectInput
                className={FILTER_SELECT_CLASS}
                value={filters.approvalStatus}
                onChange={(e) => setFilters((f) => ({ ...f, approvalStatus: e.target.value as ApprovalStatus | "" }))}
                options={[
                  { value: "", label: "সব স্ট্যাটাস" },
                  { value: "PENDING", label: "অপেক্ষমাণ" },
                  { value: "APPROVED", label: "অনুমোদিত" },
                  { value: "REJECTED", label: "বাতিল" },
                ]}
              />
            )}
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" icon={Search} onClick={applyFilters}>
                ফিল্টার
              </Button>
              {hasFilters && (
                <Button variant="outline" size="sm" icon={RotateCcw} onClick={resetFilters} title="ফিল্টার মুছুন">
                  রিসেট
                </Button>
              )}
            </div>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {applied.managerName && (
                <FilterChip label={`ব্যবস্থাপক: ${applied.managerName}`} onClear={() => clearFilter("managerName")} />
              )}
              {applied.startDate && (
                <FilterChip label={`থেকে: ${applied.startDate}`} onClear={() => clearFilter("startDate")} />
              )}
              {applied.endDate && (
                <FilterChip label={`পর্যন্ত: ${applied.endDate}`} onClear={() => clearFilter("endDate")} />
              )}
              {applied.approvalStatus && (
                <FilterChip label={`স্ট্যাটাস: ${STATUS_LABEL[applied.approvalStatus]}`} onClear={() => clearFilter("approvalStatus")} />
              )}
            </div>
          )}
        </div>

        {actionError && (
          <div className="px-5 pt-3">
            <ErrorMessage>{actionError}</ErrorMessage>
          </div>
        )}

        <Table>
          <THead>
            <THeadRow>
              <TH className="bg-ios-primary/[0.035]">তারিখ</TH>
              <TH className="bg-ios-primary/[0.035]">শাখা</TH>
              <TH className="bg-ios-primary/[0.035]">ব্যবস্থাপক</TH>
              <TH className="bg-ios-primary/[0.035]">মন্তব্য</TH>
              <TH className="bg-ios-primary/[0.035]">আইটেম</TH>
              <TH className="bg-ios-primary/[0.035]">স্ট্যাটাস</TH>
              <TH className="bg-ios-primary/[0.035]" align="right">অ্যাকশন</TH>
            </THeadRow>
          </THead>
          <tbody>
            {loading ? (
              <TableSkeletonRows colSpan={7} rows={5} />
            ) : data.items.length === 0 ? (
              <TableEmpty colSpan={7} icon={ClipboardList} title="কোনো রিপোর্ট পাওয়া যায়নি" />
            ) : (
              data.items.map((report) => {
                const status = report.approvalStatus ?? "PENDING";
                const canEdit = status === "PENDING" || status === "REJECTED";
                const complaintCount = report._count?.complaints ?? report.complaints?.length ?? 0;
                const bpCpCount = report._count?.bpCpEntries ?? report.bpCpEntries?.length ?? 0;
                return (
                  <TR
                    key={report.id}
                    className={status === "PENDING" ? "bg-amber-500/[0.04]" : undefined}
                  >
                    <TD>
                      <ReportDate date={report.reportDate} />
                    </TD>
                    <TD>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-ios-primary/10 border border-ios-primary/15 text-micro font-semibold text-ios-primary">
                        {report.branch?.code ?? `#${report.branchId}`}
                      </span>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-ios-primary/9 border border-ios-primary/15 text-ios-primary text-micro font-bold flex items-center justify-center shrink-0">
                          {initials(report.managerName)}
                        </span>
                        <span className="text-label font-semibold text-ios-foreground truncate max-w-40">
                          {report.managerName}
                        </span>
                      </div>
                    </TD>
                    <TD>
                      <span
                        className="text-caption text-ios-foreground-muted line-clamp-1 max-w-[220px] block whitespace-nowrap overflow-hidden text-ellipsis"
                        title={report.managerComments || ""}
                      >
                        {report.managerComments || "—"}
                      </span>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-ios-border-subtle/50 text-micro font-semibold text-ios-foreground-subtle whitespace-nowrap">
                          <MessageCircleWarning size={11} className={complaintCount > 0 ? "text-amber-600 dark:text-amber-400" : ""} />
                          {complaintCount} অভিযোগ
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-ios-border-subtle/50 text-micro font-semibold text-ios-foreground-subtle whitespace-nowrap">
                          <ListTodo size={11} />
                          {bpCpCount} BP/CP
                        </span>
                      </div>
                    </TD>
                    <TD>
                      <StatusBadge status={status} />
                    </TD>
                    <TD align="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="inline-flex items-center rounded-lg bg-ios-border-subtle/40 p-0.5">
                          <Button
                            variant="icon"
                            size="sm"
                            disabled={approving != null || deleting != null}
                            onClick={() => setViewing(report)}
                            title="রিপোর্ট দেখুন"
                            icon={Eye}
                          />
                          {canEdit && (
                            <>
                              <Button
                                variant="icon"
                                size="sm"
                                disabled={approving != null || deleting != null}
                                onClick={() => { setEditing(report); setShowCreate(true); }}
                                title="রিপোর্ট সম্পাদনা"
                                icon={Pencil}
                              />
                              <Button
                                variant="icon-danger"
                                size="sm"
                                disabled={approving != null || deleting === report.id}
                                loading={deleting === report.id}
                                onClick={() => setConfirmDelete(report)}
                                icon={Trash2}
                                title="রিপোর্ট মুছুন"
                              />
                            </>
                          )}
                        </div>
                        {isAdmin && status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost-green"
                              size="sm"
                              icon={Check}
                              disabled={approving != null || deleting != null}
                              loading={approving?.id === report.id && approving.status === "APPROVED"}
                              onClick={() => handleApprove(report.id, "APPROVED")}
                            >
                              অনুমোদন
                            </Button>
                            <Button
                              variant="ghost-red"
                              size="sm"
                              icon={X}
                              disabled={approving != null || deleting != null || cancelling != null}
                              onClick={() => {
                                setCancelComment("");
                                setCancelling(report);
                              }}
                            >
                              বাতিল
                            </Button>
                          </>
                        )}
                      </div>
                    </TD>
                  </TR>
                );
              })
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
