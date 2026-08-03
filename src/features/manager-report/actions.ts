"use server";

import { authenticatedFetch, getCurrentUserAction } from "@/features/auth/actions";

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
  branch?: { code?: string; name?: string };
  complaints?: Array<GuestComplaintInput & { id: number }>;
  bpCpEntries?: Array<BpCpEntryInput & { id: number }>;
}

export interface ManagerReportListResult {
  items: ManagerReportItem[];
  total: number;
  page: number;
  totalPages: number;
}

interface ManagerReportListParams {
  page?: number;
  limit?: number;
  branchId?: number;
  managerName?: string;
  startDate?: string;
  endDate?: string;
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
