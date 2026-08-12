"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  CalendarDays,
  MessageSquareText,
  ListChecks,
  PackageSearch,
  GraduationCap,
  MessageCircleWarning,
  ListTodo,
  ChevronDown,
  Search,
  RotateCcw,
  Send,
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
import { Table, THead, THeadRow, TH, TD, TR, TableEmpty } from "@/components/dashboard/table";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge as StatusBadgeShared } from "@/components/dashboard/status-badge";
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
  comment: string;
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

/** Compact height override for the filter toolbar inputs. */
const filterInputClass = "!h-10 !min-h-0 !px-3.5 !py-0 text-caption";

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
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[160px_1fr_1fr_auto] gap-2.5 rounded-xl bg-ios-border-subtle/20 p-3">
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

function DetailPanel({ report, onClose }: { report: ManagerReportItem; onClose: () => void }) {
  const user = useDashboardUser();
  const isAdmin = isAdminRole(user.role);
  const [openComplaints, setOpenComplaints] = useState(true);
  const [openBpCp, setOpenBpCp] = useState(true);
  const [openComments, setOpenComments] = useState(true);
  const [detail, setDetail] = useState<ManagerReportItem | null>(null);
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
      header={
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-ios-primary/10 border border-ios-primary/15 flex items-center justify-center shrink-0">
            <FileText size={22} className="text-ios-primary" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2 className="text-body font-bold text-ios-foreground leading-tight">
              রিপোর্ট #{data.id}
            </h2>
            <p className="text-caption text-ios-foreground-muted mt-0.5 truncate">
              {data.branch?.name ?? `Branch #${data.branchId}`} · {data.reportDate}
            </p>
          </div>
        </div>
      }
      headerExtra={<StatusBadge status={status} />}
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-ios-border-subtle bg-surface-200 shadow-sm p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InfoField icon={UserRound} label="ব্যবস্থাপক" value={data.managerName} />
            <InfoField icon={CalendarDays} label="রিপোর্টের তারিখ" value={data.reportDate} />
            <InfoField icon={MessageSquareText} label="ব্যবস্থাপকের মন্তব্য" value={data.managerComments} />
            <InfoField icon={ListChecks} label="ব্রিফিং পয়েন্ট" value={data.briefingPoints} />
            <InfoField icon={PackageSearch} label="সরবরাহ / ক্রয় সমস্যা" value={data.supplyPurchaseIssues} />
            <InfoField icon={GraduationCap} label="দৈনিক শিক্ষণীয়" value={data.dailyLearnings} />
          </div>
        </div>

        {status === "APPROVED" && data.approvedAt && (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-label font-bold text-emerald-700 dark:text-emerald-400">
                ✓ অনুমোদন করেছেন: {data.approvedBy?.name ?? "Admin"}
              </p>
              <p className="text-caption text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">
                {new Date(data.approvedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {status === "REJECTED" && (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-4 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <X size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-label font-bold text-red-700 dark:text-red-400">
                Cancelled by Admin
                {data.approvedBy?.name ? ` — ${data.approvedBy.name}` : ""}
              </p>
              {data.approvedAt && (
                <p className="text-caption text-red-700/70 dark:text-red-400/70 mt-0.5">
                  {new Date(data.approvedAt).toLocaleString()}
                </p>
              )}
              {data.approvalComment && (
                <p className="text-caption text-red-700/80 dark:text-red-400/80 mt-1.5 whitespace-pre-wrap break-words">
                  {data.approvalComment}
                </p>
              )}
            </div>
          </div>
        )}

        <ExpandableSection
          icon={MessageCircleWarning}
          title="অতিরিক্ত অভিযোগ"
          count={data.complaints?.length ?? 0}
          emptyText="কোনো অভিযোগ রেকর্ড করা হয়নি।"
          open={openComplaints}
          onToggle={() => setOpenComplaints((o) => !o)}
        >
          <div className="space-y-2.5">
            {(data.complaints ?? []).map((c) => (
              <div key={c.id} className="rounded-xl border border-ios-border-subtle bg-surface-100 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-label font-semibold text-ios-foreground">{c.guestName}</p>
                  <p className="text-micro text-ios-foreground-subtle flex items-center gap-1 shrink-0">
                    <Phone size={11} /> {c.mobile}
                  </p>
                </div>
                <p className="text-caption text-ios-foreground-muted">{c.complaintDetails}</p>
                {(c.serviceProviderName || c.responsiblePerson) && (
                  <p className="text-micro text-ios-foreground-faint">
                    Provider: {c.serviceProviderName || "—"} · Responsible: {c.responsiblePerson || "—"}
                  </p>
                )}
                <p className="text-micro text-ios-foreground-subtle">
                  Action: {c.actionTaken} · Solution: {c.solution}
                </p>
              </div>
            ))}
            {(data.complaints ?? []).length === 0 && (
              <p className="text-caption text-ios-foreground-faint">কোনো অভিযোগ রেকর্ড করা হয়নি।</p>
            )}
          </div>
        </ExpandableSection>

        <ExpandableSection
          icon={ListTodo}
          title="BP / CP এন্ট্রি"
          count={data.bpCpEntries?.length ?? 0}
          emptyText="কোনো BP / CP এন্ট্রি রেকর্ড করা হয়নি।"
          open={openBpCp}
          onToggle={() => setOpenBpCp((o) => !o)}
        >
          <div className="space-y-2.5">
            {(data.bpCpEntries ?? []).map((e) => (
              <div key={e.id} className="rounded-xl border border-ios-border-subtle bg-surface-100 p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-label font-semibold text-ios-foreground">{e.guestName}</p>
                  <p className="text-micro text-ios-foreground-subtle flex items-center gap-1 mt-0.5">
                    <Phone size={11} /> {e.mobile}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-micro font-bold bg-ios-primary/10 text-ios-primary shrink-0">
                  <Clock size={11} /> {e.entryType === "TODAY" ? "আজ" : "আগামীকাল"}
                </span>
              </div>
            ))}
            {(data.bpCpEntries ?? []).length === 0 && (
              <p className="text-caption text-ios-foreground-faint">কোনো BP / CP এন্ট্রি রেকর্ড করা হয়নি।</p>
            )}
          </div>
        </ExpandableSection>

        <ExpandableSection
          icon={MessageSquareText}
          title="প্রশাসকের মন্তব্য"
          count={comments.length}
          emptyText="কোনো মন্তব্য নেই।"
          open={openComments}
          onToggle={() => setOpenComments((o) => !o)}
        >
          <div className="space-y-2.5">
            {comments.map((c) => (
              <div key={c.id} className="rounded-xl border border-ios-border-subtle bg-surface-100 p-3.5 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-label font-semibold text-ios-foreground">{c.user?.name ?? "Admin"}</p>
                  <p className="text-micro text-ios-foreground-subtle shrink-0">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                  </p>
                </div>
                <p className="text-caption text-ios-foreground-muted whitespace-pre-wrap break-words">{c.comment}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-caption text-ios-foreground-faint">কোনো মন্তব্য নেই।</p>
            )}
          </div>
          {isAdmin && (
            <div className="mt-3 space-y-2">
              <TextAreaInput
                rows={2}
                placeholder="মন্তব্য লিখুন…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              {commentError && <ErrorMessage>{commentError}</ErrorMessage>}
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Send}
                  loading={commentSaving}
                  disabled={!newComment.trim()}
                  onClick={handleAddComment}
                >
                  মন্তব্য যোগ করুন
                </Button>
              </div>
            </div>
          )}
        </ExpandableSection>
      </div>
    </Modal>
  );
}

function InfoField({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-ios-primary/[0.07] border border-ios-primary/10 text-ios-primary flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={16} strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <p className="text-micro font-semibold text-ios-foreground-faint">{label}</p>
        <p className="text-label font-semibold text-ios-foreground mt-1 whitespace-pre-wrap break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

function ExpandableSection({
  icon: Icon,
  title,
  count,
  emptyText,
  open,
  onToggle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
  emptyText: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ios-border-subtle bg-surface-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 text-left transition-colors duration-200 hover:bg-ios-border-subtle/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-primary/40"
      >
        <div className="w-9 h-9 rounded-full bg-ios-primary/[0.08] text-ios-primary flex items-center justify-center shrink-0">
          <Icon size={16} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-label font-bold text-ios-foreground">
            {title} <span className="text-ios-foreground-faint font-semibold">({count})</span>
          </p>
          {count === 0 && <p className="text-caption text-ios-foreground-muted mt-0.5">{emptyText}</p>}
        </div>
        <ChevronDown
          size={16}
          className={`text-ios-foreground-subtle shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 sm:px-5 pb-4">{children}</div>}
    </div>
  );
}

const STAT_TONES = {
  primary: "bg-ios-primary/[0.09] border-ios-primary/15 text-ios-primary",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  red: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: keyof typeof STAT_TONES;
}) {
  return (
    <div className="rounded-2xl border border-ios-border-subtle bg-surface-300 p-5 transition-colors duration-200 hover:border-ios-border hover:bg-surface-200">
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-semibold text-ios-foreground-muted truncate">{label}</p>
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${STAT_TONES[tone]}`}>
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>
      <p className="mt-3.5 text-title font-extrabold tracking-tight text-ios-foreground leading-none">{value}</p>
    </div>
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
  const [filters, setFilters] = useState<{
    managerName: string;
    startDate: string;
    endDate: string;
    approvalStatus: ApprovalStatus | "";
  }>({
    managerName: "",
    startDate: "",
    endDate: "",
    approvalStatus: "",
  });
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
    const [result, summaryResult] = await Promise.all([
      getManagerReports({
        ...filters,
        approvalStatus: filters.approvalStatus || undefined,
        page,
        limit: 15,
      }),
      getManagerReportSummary(),
    ]);
    setData(result);
    setSummary(summaryResult);
    setLoading(false);
  }, [filters, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    if (isAdmin) {
      getBranchList().then(setBranches);
    }
  }, [isAdmin]);

  const handleApprove = async (id: number, status: "APPROVED" | "REJECTED") => {
    if (approving != null) return;
    setActionError("");
    setApproving({ id, status });
    const result = await setManagerReportApprovalAction(id, status);
    setApproving(null);
    if (result.success) {
      router.refresh();
      void load();
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
      router.refresh();
      void load();
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
      router.refresh();
      void load();
    } else {
      setActionError(result.error || "Failed to delete report");
    }
  };

  const hasFilters =
    filters.managerName !== "" ||
    filters.startDate !== "" ||
    filters.endDate !== "" ||
    filters.approvalStatus !== "";

  const resetFilters = () => {
    setPage(1);
    setFilters({ managerName: "", startDate: "", endDate: "", approvalStatus: "" });
  };

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
          onSaved={() => void load()}
        />
      )}
      {viewing && <DetailPanel report={viewing} onClose={() => setViewing(null)} />}

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Inbox} label="মোট রিপোর্ট" value={summary.total} tone="primary" />
        <StatCard icon={Clock} label="অপেক্ষমাণ" value={summary.pending} tone="amber" />
        <StatCard icon={FileCheck2} label="অনুমোদিত" value={summary.approved} tone="green" />
        <StatCard icon={X} label="বাতিল" value={summary.rejected} tone="red" />
      </div>

      <div className="rounded-2xl border border-ios-border-subtle bg-surface-300 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-ios-border-subtle flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-ios-primary/[0.09] border border-ios-primary/10 text-ios-primary flex items-center justify-center shrink-0">
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

        <div className="px-5 py-4 border-b border-ios-border-subtle">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1.5fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(160px,1fr)_auto] gap-3 items-center">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-foreground-faint pointer-events-none" />
              <TextInput
                className={`${filterInputClass} !pl-9`}
                placeholder="ব্যবস্থাপকের নাম…"
                value={filters.managerName}
                onChange={(e) => setFilters((f) => ({ ...f, managerName: e.target.value }))}
              />
            </div>
            <TextInput
              className={filterInputClass}
              type="date"
              aria-label="Start date"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            />
            <TextInput
              className={filterInputClass}
              type="date"
              aria-label="End date"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            />
            {isAdmin && (
              <SelectInput
                className={`${filterInputClass} !pr-9`}
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
            <div className="flex items-center gap-2 justify-end">
              <Button variant="primary" size="sm" icon={Search} onClick={() => { setPage(1); void load(); }}>
                ফিল্টার
              </Button>
              {hasFilters && (
                <Button variant="outline" size="sm" icon={RotateCcw} onClick={resetFilters} title="ফিল্টার মুছুন">
                  রিসেট
                </Button>
              )}
            </div>
          </div>
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
              <TH className="bg-ios-primary/[0.035]">অভিযোগ</TH>
              <TH className="bg-ios-primary/[0.035]">BP/CP</TH>
              <TH className="bg-ios-primary/[0.035]">স্ট্যাটাস</TH>
              <TH className="bg-ios-primary/[0.035]" align="right">অ্যাকশন</TH>
            </THeadRow>
          </THead>
          <tbody>
            {loading ? (
              <TR>
                <TD colSpan={8} align="center">
                  <p className="text-caption text-ios-foreground-subtle font-medium py-8">রিপোর্ট লোড হচ্ছে…</p>
                </TD>
              </TR>
            ) : data.items.length === 0 ? (
              <TableEmpty colSpan={8} icon={ClipboardList} title="কোনো রিপোর্ট পাওয়া যায়নি" />
            ) : (
              data.items.map((report) => {
                const status = report.approvalStatus ?? "PENDING";
                const canEdit = status === "PENDING" || status === "REJECTED";
                const complaintCount = report._count?.complaints ?? report.complaints?.length ?? 0;
                const bpCpCount = report._count?.bpCpEntries ?? report.bpCpEntries?.length ?? 0;
                return (
                  <TR key={report.id}>
                    <TD>
                      <span className="text-caption font-bold text-ios-foreground whitespace-nowrap">{report.reportDate}</span>
                    </TD>
                    <TD>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-ios-primary/10 border border-ios-primary/15 text-micro font-semibold text-ios-primary">
                        {report.branch?.code ?? `#${report.branchId}`}
                      </span>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-ios-primary/[0.09] border border-ios-primary/15 text-ios-primary text-micro font-bold flex items-center justify-center shrink-0">
                          {initials(report.managerName)}
                        </span>
                        <span className="text-label font-semibold text-ios-foreground truncate max-w-[160px]">
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
                      {complaintCount > 0 ? (
                        <span className="text-caption font-semibold text-ios-foreground-subtle">{complaintCount}</span>
                      ) : (
                        <span className="text-caption text-ios-foreground-faint">0</span>
                      )}
                    </TD>
                    <TD>
                      {bpCpCount > 0 ? (
                        <span className="text-caption font-semibold text-ios-foreground-subtle">{bpCpCount}</span>
                      ) : (
                        <span className="text-caption text-ios-foreground-faint">0</span>
                      )}
                    </TD>
                    <TD>
                      <StatusBadge status={status} />
                    </TD>
                    <TD align="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="icon"
                          disabled={approving != null || deleting != null}
                          onClick={() => setViewing(report)}
                          title="রিপোর্ট দেখুন"
                          icon={Eye}
                        />
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
                        {canEdit && (
                          <>
                            <Button
                              variant="icon"
                              disabled={approving != null || deleting != null}
                              onClick={() => { setEditing(report); setShowCreate(true); }}
                              title="রিপোর্ট সম্পাদনা"
                              icon={Pencil}
                            />
                            <Button
                              variant="icon-danger"
                              disabled={approving != null || deleting === report.id}
                              loading={deleting === report.id}
                              onClick={() => setConfirmDelete(report)}
                              icon={Trash2}
                              title="রিপোর্ট মুছুন"
                            />
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
