"use server";

import { authenticatedFetch } from "@/features/auth/actions";

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  branchName: string | null;
  actorName: string | null;
  entityId: number | null;
  read: boolean;
  createdAt: string;
}

interface NotificationRow {
  id?: number;
  type?: string;
  title?: string;
  message?: string;
  branchName?: string | null;
  actorName?: string | null;
  entityId?: number | null;
  read?: boolean;
  createdAt?: string;
}

export async function getNotificationsAction(limit = 50): Promise<{ items: NotificationItem[]; unread: number }> {
  try {
    const res = await authenticatedFetch(`/api/v1/notifications?page=1&limit=${limit}&unreadOnly=true`);
    if (!res.ok) return { items: [], unread: 0 };

    const json = await res.json();
    const rows = (json.data?.data ?? []) as NotificationRow[];
    const items: NotificationItem[] = rows.map((n) => ({
      id: Number(n.id),
      type: n.type ?? "",
      title: n.title ?? "",
      message: n.message ?? "",
      branchName: n.branchName ?? null,
      actorName: n.actorName ?? null,
      entityId: n.entityId ?? null,
      read: Boolean(n.read),
      createdAt: n.createdAt ?? new Date().toISOString(),
    }));

    let unread = items.filter((i) => !i.read).length;
    try {
      const unreadRes = await authenticatedFetch("/api/v1/notifications/unread-count");
      if (unreadRes.ok) {
        const unreadJson = await unreadRes.json();
        unread = Number(unreadJson.data?.count) || 0;
      }
    } catch {
      // Fall back to the count computed from the fetched page.
    }

    return { items, unread };
  } catch {
    return { items: [], unread: 0 };
  }
}

export async function markNotificationReadAction(id: number): Promise<void> {
  try {
    await authenticatedFetch(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
  } catch {
    // Best-effort: the optimistic UI state already reflects the change.
  }
}

export async function markAllNotificationsReadAction(): Promise<void> {
  try {
    await authenticatedFetch("/api/v1/notifications/read-all", { method: "POST" });
  } catch {
    // Best-effort.
  }
}

export async function deleteNotificationAction(id: number): Promise<void> {
  try {
    await authenticatedFetch(`/api/v1/notifications/${id}`, { method: "DELETE" });
  } catch {
    // Best-effort.
  }
}
