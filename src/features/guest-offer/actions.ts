"use server";

import { authenticatedFetch, getCurrentUserAction } from "@/features/auth/actions";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface DiscountLogItem {
  id: number;
  branchId: number;
  logDate: string;
  guestName: string;
  mobile: string;
  hadLunch: boolean;
  hadDinner: boolean;
  totalBill: number;
  discountPercent: number;
  discountAmount: number;
  reasonForDiscount: string;
  approvalStatus: ApprovalStatus;
  approvedAt?: string | null;
  branch?: { code?: string; name?: string };
  offeredBy?: { name?: string };
}

export interface EntertainmentLogItem {
  id: number;
  branchId: number;
  logDate: string;
  guestName: string;
  mobile: string;
  hadLunch: boolean;
  hadDinner: boolean;
  foodName: string;
  foodCost: number;
  reasonForEntertainment: string;
  approvalStatus: ApprovalStatus;
  approvedAt?: string | null;
  branch?: { code?: string; name?: string };
  offeredBy?: { name?: string };
}

export interface GuestOfferSummary {
  discount: {
    totalBill: number;
    totalDiscountAmount: number;
    logs: number;
  };
  entertainment: {
    totalCost: number;
    logs: number;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface OfferListParams {
  page?: number;
  limit?: number;
  branchId?: number;
  startDate?: string;
  endDate?: string;
  approvalStatus?: ApprovalStatus;
  search?: string;
}

async function scopedBranchId(): Promise<number | undefined> {
  const user = await getCurrentUserAction();
  return user?.role === "BRANCH_MANAGER" ? user.branchId ?? undefined : undefined;
}

async function buildQuery(params: OfferListParams): Promise<URLSearchParams> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  query.set("sortBy", "logDate");
  query.set("sortOrder", "desc");
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.approvalStatus) query.set("approvalStatus", params.approvalStatus);
  if (params.search) query.set("search", params.search);
  const scope = await scopedBranchId();
  const branchId = params.branchId ?? scope;
  if (branchId) query.set("branchId", String(branchId));
  return query;
}

function unwrapPaginated<T>(json: Record<string, unknown>): PaginatedResult<T> {
  const wrapped = (json.data ?? {}) as Record<string, unknown>;
  const items = (wrapped.data ?? []) as T[];
  const meta = (wrapped.meta ?? json.meta ?? {}) as Record<string, number | undefined>;
  return {
    items,
    total: meta.totalRecords ?? items.length,
    page: meta.page ?? 1,
    totalPages: meta.totalPages ?? 1,
  };
}

export async function getDiscountLogs(params: OfferListParams = {}): Promise<PaginatedResult<DiscountLogItem>> {
  try {
    const res = await authenticatedFetch(`/api/v1/guest-offers/discounts?${(await buildQuery(params)).toString()}`);
    const json = await res.json();
    return unwrapPaginated<DiscountLogItem>(json);
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getEntertainmentLogs(params: OfferListParams = {}): Promise<PaginatedResult<EntertainmentLogItem>> {
  try {
    const res = await authenticatedFetch(`/api/v1/guest-offers/entertainments?${(await buildQuery(params)).toString()}`);
    const json = await res.json();
    return unwrapPaginated<EntertainmentLogItem>(json);
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getGuestOfferSummary(params: OfferListParams = {}): Promise<GuestOfferSummary | null> {
  try {
    const query = new URLSearchParams();
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    const scope = await scopedBranchId();
    const branchId = params.branchId ?? scope;
    if (branchId) query.set("branchId", String(branchId));
    const qs = query.toString();
    const res = await authenticatedFetch(`/api/v1/guest-offers/summary${qs ? `?${qs}` : ""}`);
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function createDiscountAction(data: {
  branchId: number;
  logDate: string;
  guestName: string;
  mobile: string;
  hadLunch?: boolean;
  hadDinner?: boolean;
  totalBill: number;
  discountPercent: number;
  reasonForDiscount: string;
}): Promise<{ success: boolean; data?: DiscountLogItem; error?: string }> {
  try {
    const res = await authenticatedFetch("/api/v1/guest-offers/discounts", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to create discount log" };
    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create discount log" };
  }
}

export async function updateDiscountAction(
  id: number,
  data: Partial<{
    logDate: string;
    guestName: string;
    mobile: string;
    hadLunch: boolean;
    hadDinner: boolean;
    totalBill: number;
    discountPercent: number;
    reasonForDiscount: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch(`/api/v1/guest-offers/discounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to update discount log" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update discount log" };
  }
}

export async function setDiscountApprovalAction(
  id: number,
  approvalStatus: Extract<ApprovalStatus, "APPROVED" | "REJECTED">
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch(`/api/v1/guest-offers/discounts/${id}/approval`, {
      method: "PATCH",
      body: JSON.stringify({ approvalStatus }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to update approval" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update approval" };
  }
}

export async function deleteDiscountAction(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch(`/api/v1/guest-offers/discounts/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to delete discount log" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete discount log" };
  }
}

export async function createEntertainmentAction(data: {
  branchId: number;
  logDate: string;
  guestName: string;
  mobile: string;
  hadLunch?: boolean;
  hadDinner?: boolean;
  foodName: string;
  foodCost: number;
  reasonForEntertainment: string;
}): Promise<{ success: boolean; data?: EntertainmentLogItem; error?: string }> {
  try {
    const res = await authenticatedFetch("/api/v1/guest-offers/entertainments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to create entertainment log" };
    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create entertainment log" };
  }
}

export async function updateEntertainmentAction(
  id: number,
  data: Partial<{
    logDate: string;
    guestName: string;
    mobile: string;
    hadLunch: boolean;
    hadDinner: boolean;
    foodName: string;
    foodCost: number;
    reasonForEntertainment: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch(`/api/v1/guest-offers/entertainments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to update entertainment log" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update entertainment log" };
  }
}

export async function setEntertainmentApprovalAction(
  id: number,
  approvalStatus: Extract<ApprovalStatus, "APPROVED" | "REJECTED">
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch(`/api/v1/guest-offers/entertainments/${id}/approval`, {
      method: "PATCH",
      body: JSON.stringify({ approvalStatus }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to update approval" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update approval" };
  }
}

export async function deleteEntertainmentAction(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch(`/api/v1/guest-offers/entertainments/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to delete entertainment log" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete entertainment log" };
  }
}
