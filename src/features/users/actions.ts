"use server";

import { authenticatedFetch, getCurrentUserAction } from "@/features/auth/actions";
import type { User, UserRole } from "@/types";

export interface UsersListResult {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
}): Promise<UsersListResult> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.role) query.set("role", params.role);

    const res = await authenticatedFetch(`/api/v1/users?${query.toString()}`);
    const json = await res.json();
    // Backend wraps paginated results in { data: { data: [...], meta: {...} } }
    const wrapped = json.data ?? {};
    const meta = wrapped.meta ?? json.meta;

    return {
      users: wrapped.data ?? json.data ?? [],
      total: meta?.totalRecords ?? 0,
      page: meta?.page ?? 1,
      totalPages: meta?.totalPages ?? 1,
    };
  } catch {
    return { users: [], total: 0, page: 1, totalPages: 0 };
  }
}

async function assertNotManager(): Promise<string | null> {
  const user = await getCurrentUserAction();
  if (user?.role === "BRANCH_MANAGER") return "Branch managers cannot perform this action";
  return null;
}

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branchId?: number;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const denied = await assertNotManager();
    if (denied) return { success: false, error: denied };
    const res = await authenticatedFetch("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message || "Failed to create user" };
    return { success: true, user: json.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create user" };
  }
}

export async function updateUserAction(
  id: number,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    branchId?: number | null;
    isActive?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const denied = await assertNotManager();
    if (denied) return { success: false, error: denied };
    const res = await authenticatedFetch(`/api/v1/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json.message || "Failed to update user" };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update user" };
  }
}

export async function toggleUserActiveAction(
  userId: number,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const denied = await assertNotManager();
    if (denied) return { success: false, error: denied };
    const res = await authenticatedFetch(`/api/v1/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json.message || "Failed to update status" };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update status" };
  }
}

export async function deleteUserAction(userId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const denied = await assertNotManager();
    if (denied) return { success: false, error: denied };
    const res = await authenticatedFetch(`/api/v1/users/${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json.message || "Failed to delete user" };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete user" };
  }
}
