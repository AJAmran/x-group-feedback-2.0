"use server";

import { authenticatedFetch, getCurrentUserAction } from "@/features/auth/actions";

export type InventoryStatus = "DRAFT" | "SUBMITTED" | "LOCKED";

export interface InventoryCategory {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface InventoryItem {
  id: number;
  categoryId: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  category?: { name?: string };
}

export interface InventoryStatement {
  id: number;
  branchId: number;
  statementMonth: string;
  status: InventoryStatus;
  submittedAt?: string | null;
  branch?: { code?: string; name?: string };
}

export interface InventoryLine {
  id: number;
  itemId: number;
  openingStock: number;
  added: number;
  brokenLost: number;
  reject: number;
  closingStock: number;
  item: { name: string; category: { name: string } };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

async function scopedBranchId(): Promise<number | undefined> {
  const user = await getCurrentUserAction();
  return user?.role === "BRANCH_MANAGER" ? user.branchId ?? undefined : undefined;
}

export async function getInventoryCategories(): Promise<InventoryCategory[]> {
  try {
    const res = await authenticatedFetch("/api/v1/inventory/categories");
    const json = await res.json();
    return (json.data ?? []) as InventoryCategory[];
  } catch {
    return [];
  }
}

export async function getInventoryItems(categoryId?: number): Promise<InventoryItem[]> {
  try {
    const query = new URLSearchParams();
    if (categoryId) query.set("categoryId", String(categoryId));
    query.set("limit", "500");
    const qs = query.toString();
    const res = await authenticatedFetch(`/api/v1/inventory/items?${qs}`);
    const json = await res.json();
    const wrapped = (json.data ?? {}) as Record<string, unknown>;
    return ((wrapped.data ?? []) as InventoryItem[]) ?? [];
  } catch {
    return [];
  }
}

export async function getInventoryStatements(params: {
  page?: number;
  limit?: number;
  branchId?: number;
  statementMonth?: string;
  status?: InventoryStatus;
} = {}): Promise<PaginatedResult<InventoryStatement>> {
  try {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 20));
    query.set("sortBy", "statementMonth");
    query.set("sortOrder", "desc");
    if (params.statementMonth) query.set("statementMonth", params.statementMonth);
    if (params.status) query.set("status", params.status);
    const scope = await scopedBranchId();
    const branchId = params.branchId ?? scope;
    if (branchId) query.set("branchId", String(branchId));

    const res = await authenticatedFetch(`/api/v1/inventory/statements?${query.toString()}`);
    const json = await res.json();
    const wrapped = (json.data ?? {}) as Record<string, unknown>;
    const items = (wrapped.data ?? []) as InventoryStatement[];
    const meta = (wrapped.meta ?? json.meta ?? {}) as Record<string, number | undefined>;
    return {
      items,
      total: meta.totalRecords ?? items.length,
      page: meta.page ?? 1,
      totalPages: meta.totalPages ?? 1,
    };
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getInventoryStatement(id: number): Promise<InventoryStatement | null> {
  try {
    const res = await authenticatedFetch(`/api/v1/inventory/statements/${id}`);
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function getInventoryStatementLines(id: number): Promise<InventoryLine[]> {
  try {
    const res = await authenticatedFetch(`/api/v1/inventory/statements/${id}/lines`);
    const json = await res.json();
    return (json.data ?? []) as InventoryLine[];
  } catch {
    return [];
  }
}

export async function createInventoryStatementAction(statementMonth: string): Promise<{
  success: boolean;
  data?: InventoryStatement;
  error?: string;
}> {
  try {
    const res = await authenticatedFetch("/api/v1/inventory/statements", {
      method: "POST",
      body: JSON.stringify({ statementMonth }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to create statement" };
    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create statement" };
  }
}

export async function updateInventoryStatementLinesAction(
  id: number,
  lines: Array<{ itemId: number; added?: number; brokenLost?: number; reject?: number }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch(`/api/v1/inventory/statements/${id}/lines`, {
      method: "PATCH",
      body: JSON.stringify({ lines }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to save lines" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to save lines" };
  }
}

export async function updateInventoryStatementStatusAction(
  id: number,
  status: Extract<InventoryStatus, "SUBMITTED" | "LOCKED">
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await authenticatedFetch(`/api/v1/inventory/statements/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to update status" };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update status" };
  }
}
