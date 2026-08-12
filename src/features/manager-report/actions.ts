"use server";

import { authenticatedFetch, getCurrentUserAction } from "@/features/auth/actions";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface GuestComplaintInput {
  guestName: string;
  mobile: string;
  email?: string | null;
  complaintDetails: string;
  serviceProviderName: string;
  responsiblePerson: string;
  actionTaken: string;
  solution: string;
}

export interface BpCpEntryInput {
  entryType: "TODAY" | "TOMORROW";
  guestName: string;
  mobile: string;
  comment?: string | null;
}

export interface ManagerReportItem {
  id: number;
  branchId: number;
  managerName: string;
  reportDate: string;
  managerComments: string;
  supplyPurchaseIssues: string;
  briefingPoints: string;
  dailyLearnings: string;
  approvalStatus: ApprovalStatus;
  approvedAt?: string | null;
  approvedBy?: { name?: string };
  approvalComment?: string | null;
  branch?: { code?: string; name?: string };
  complaints?: Array<GuestComplaintInput & { id: number }>;
  bpCpEntries?: Array<BpCpEntryInput & { id: number }>;
  comments?: ManagerReportCommentItem[];
  _count?: { complaints: number; bpCpEntries: number };
}

export interface ManagerReportCommentItem {
  id: number;
  reportId: number;
  userId: number;
  comment: string;
  createdAt: string;
  user?: { id?: number; name?: string; role?: string };
}

export interface ManagerReportListResult {
  items: ManagerReportItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ManagerReportSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface ManagerReportListParams {
  page?: number;
  limit?: number;
  branchId?: number;
  managerName?: string;
  startDate?: string;
  endDate?: string;
  approvalStatus?: ApprovalStatus;
}

async function scopedBranchId(): Promise<number | undefined> {
  const user = await getCurrentUserAction();
  return user?.role === "BRANCH_MANAGER" ? user.branchId ?? undefined : undefined;
}

export async function getManagerReports(params: ManagerReportListParams = {}): Promise<ManagerReportListResult> {
  try {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 20));
    query.set("sortBy", "reportDate");
    query.set("sortOrder", "desc");
    if (params.managerName) query.set("managerName", params.managerName);
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    if (params.approvalStatus) query.set("approvalStatus", params.approvalStatus);
    const scope = await scopedBranchId();
    const branchId = params.branchId ?? scope;
    if (branchId) query.set("branchId", String(branchId));

    const res = await authenticatedFetch(`/api/v1/manager-reports?${query.toString()}`);
    const json = await res.json();
    const wrapped = json.data ?? {};
    const items = (wrapped.data ?? []) as ManagerReportItem[];
    const meta = wrapped.meta ?? json.meta;

    return {
      items,
      total: meta?.totalRecords ?? items.length,
      page: meta?.page ?? params.page ?? 1,
      totalPages: meta?.totalPages ?? 1,
    };
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getManagerReportDetail(id: number): Promise<ManagerReportItem | null> {
  try {
    const res = await authenticatedFetch(`/api/v1/manager-reports/${id}`);
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function getManagerReportSummary(): Promise<ManagerReportSummary> {
  try {
    const res = await authenticatedFetch("/api/v1/manager-reports/summary");
    const json = await res.json();
    return json.data ?? { total: 0, pending: 0, approved: 0, rejected: 0 };
  } catch {
    return { total: 0, pending: 0, approved: 0, rejected: 0 };
  }
}

export async function createManagerReportAction(data: {
  branchId: number;
  managerName: string;
  reportDate: string;
  managerComments?: string;
  supplyPurchaseIssues?: string;
  briefingPoints?: string;
  dailyLearnings?: string;
  complaints?: GuestComplaintInput[];
  bpCpEntries?: BpCpEntryInput[];
}): Promise<{ success: boolean; data?: ManagerReportItem; error?: string }> {
  try {
    const res = await authenticatedFetch("/api/v1/manager-reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to create report" };
    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create report" };
  }
}

export async function updateManagerReportAction(
  id: number,
  data: Partial<{
    managerName: string;
    reportDate: string;
    managerComments: string;
    supplyPurchaseIssues: string;
    briefingPoints: string;
    dailyLearnings: string;
    complaints: GuestComplaintInput[];
    bpCpEntries: BpCpEntryInput[];
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch(`/api/v1/manager-reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to update report" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update report" };
  }
}

export async function deleteManagerReportAction(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch(`/api/v1/manager-reports/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to delete report" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete report" };
  }
}

export async function setManagerReportApprovalAction(
  id: number,
  approvalStatus: Extract<ApprovalStatus, "APPROVED" | "REJECTED">,
  approvalComment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch(`/api/v1/manager-reports/${id}/approval`, {
      method: "PATCH",
      body: JSON.stringify({
        approvalStatus,
        ...(approvalComment ? { approvalComment } : {}),
      }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to update approval" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update approval" };
  }
}

export async function getManagerReportComments(id: number): Promise<ManagerReportCommentItem[]> {
  try {
    const res = await authenticatedFetch(`/api/v1/manager-reports/${id}/comments`);
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function addManagerReportComment(
  id: number,
  comment: string
): Promise<{ success: boolean; comment?: ManagerReportCommentItem; error?: string }> {
  try {
    const res = await authenticatedFetch(`/api/v1/manager-reports/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to add comment" };
    return { success: true, comment: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to add comment" };
  }
}
