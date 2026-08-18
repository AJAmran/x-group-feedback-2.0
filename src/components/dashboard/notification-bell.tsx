"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, FileText, ClipboardCheck, CheckCheck } from "lucide-react";
import { getAlertsData } from "@/features/dashboard/actions";
import {
  getNotificationsAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
  type NotificationItem,
} from "@/features/notifications/actions";
import { onNotificationCreated } from "@/lib/notification-events";
import { cn } from "@/lib/utils";

const NOTIFICATION_LINKS: Record<string, string> = {
  MANAGER_REPORT_SUBMITTED: "/dashboard/manager-report",
  INVENTORY_STATEMENT_SUBMITTED: "/dashboard/inventory",
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  if (diff < 60_000) return "Just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function NotificationIcon({ type }: { type: string }) {
  if (type === "INVENTORY_STATEMENT_SUBMITTED") {
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-xg-positive-soft border border-xg-positive/15 text-xg-positive shrink-0">
        <ClipboardCheck size={15} strokeWidth={2} />
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-ios-primary/9 border border-ios-primary/10 text-ios-primary shrink-0">
      <FileText size={15} strokeWidth={2} />
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 px-3 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-xl bg-ios-border-subtle/70 shrink-0" />
      <div className="flex-1 space-y-1.5 pt-0.5">
        <div className="h-2.5 w-2/3 rounded-full bg-ios-border-subtle/70" />
        <div className="h-2 w-full rounded-full bg-ios-border-subtle/50" />
        <div className="h-2 w-1/3 rounded-full bg-ios-border-subtle/40" />
      </div>
    </div>
  );
}

/**
 * Notification bell for the dashboard.
 *
 * Two sources are merged into one panel:
 *  1. Activity feed — persisted submission notifications (a branch manager
 *     submitting a daily report or inventory statement). Unread items are
 *     removed (deleted) when opened and can be cleared via "Mark all read".
 *     The unread badge reflects the remaining feed.
 *  2. System alerts — critical analytics alerts (e.g. a branch rated < 3.0).
 *
 * Live updates arrive over the shared SSE connection owned by RealtimeSync,
 * which broadcasts `notification.created` through `onNotificationCreated`.
 */
export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [alerts, setAlerts] = useState<{ severity: string; title: string; message: string }[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  // Live refresh used by the SSE notification event subscription.
  const refresh = useCallback(() => {
    getNotificationsAction(50).then(({ items: nextItems, unread: nextUnread }) => {
      if (!mountedRef.current) return;
      setItems(nextItems);
      setUnread(nextUnread);
    });
    getAlertsData()
      .then((nextAlerts) => {
        if (!mountedRef.current) return;
        setAlerts(nextAlerts);
        setLoading(false);
      })
      .catch(() => {
        if (mountedRef.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Initial load. Each fetch resolves asynchronously, so these `.then`
    // callbacks are the only places that touch React state (the lint rule
    // react-hooks/set-state-in-effect forbids synchronous setState here).
    getNotificationsAction(50).then(({ items: nextItems, unread: nextUnread }) => {
      if (!mountedRef.current) return;
      setItems(nextItems);
      setUnread(nextUnread);
    });
    getAlertsData()
      .then((nextAlerts) => {
        if (!mountedRef.current) return;
        setAlerts(nextAlerts);
        setLoading(false);
      })
      .catch(() => {
        if (mountedRef.current) setLoading(false);
      });

    const unsubscribe = onNotificationCreated(() => {
      void refresh();
    });
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [refresh]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleItemClick = (n: NotificationItem) => {
    setItems((prev) => prev.filter((i) => i.id !== n.id));
    setUnread((u) => Math.max(0, u - 1));
    void deleteNotificationAction(n.id);
    const href = NOTIFICATION_LINKS[n.type];
    if (href) {
      setOpen(false);
      router.push(href);
    }
  };

  const handleMarkAllRead = () => {
    setItems([]);
    setUnread(0);
    void markAllNotificationsReadAction();
    items.forEach((n) => void deleteNotificationAction(n.id));
  };

  const criticalAlerts = alerts.filter((a) => a.severity === "critical");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-ios-border-subtle bg-surface-300 text-ios-foreground-subtle hover:text-ios-foreground hover:border-ios-primary/30 transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={16} strokeWidth={2.1} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[oklch(54%_0.17_27)] text-white text-[0.5625rem] font-bold shadow-sm">
            {unread}
          </span>
        )}
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full transition-colors",
            unread > 0 ? "bg-[oklch(54%_0.17_27)]" : "bg-emerald-500",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 glass-card-plain rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-ios-foreground-faint">
                Notifications
              </p>
              {unread > 0 && (
                <span className="flex items-center justify-center min-w-4 h-4 px-1.5 rounded-full bg-ios-primary/12 text-ios-primary text-[0.625rem] font-bold">
                  {unread}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-micro font-semibold text-ios-primary hover:text-ios-primary/80 transition-colors"
              >
                <CheckCheck size={13} strokeWidth={2.2} />
                Mark all read
              </button>
            )}
          </div>

          <div className="border-t border-ios-border-subtle max-h-80 overflow-y-auto">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : items.length > 0 ? (
              <div className="p-1.5 space-y-0.5">
                {items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={cn(
                      "w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors",
                      n.read
                        ? "hover:bg-ios-border-subtle/60"
                        : "bg-ios-primary/6 hover:bg-ios-primary/10",
                    )}
                  >
                    <NotificationIcon type={n.type} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-label text-ios-foreground", !n.read && "font-bold")}>
                        {n.title}
                      </p>
                      <p className="text-micro text-ios-foreground-muted leading-relaxed mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[0.625rem] text-ios-foreground-faint font-medium mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span
                        aria-hidden="true"
                        className="mt-1.5 w-2 h-2 rounded-full bg-ios-primary shrink-0"
                      />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-label font-semibold text-ios-foreground">No notifications yet</p>
                <p className="text-micro text-ios-foreground-faint mt-1">
                  Branch manager report submissions will appear here.
                </p>
              </div>
            )}
          </div>

          {criticalAlerts.length > 0 && (
            <>
              <div className="px-4 pt-2.5 pb-1">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-ios-foreground-faint">
                  System alerts
                </p>
              </div>
              <div className="px-3 pb-3 space-y-1">
                {criticalAlerts.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-xg-negative-soft"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 w-2 h-2 rounded-full shrink-0 bg-xg-negative"
                    />
                    <div className="min-w-0">
                      <p className="text-label font-bold text-ios-foreground">{a.title}</p>
                      <p className="text-micro text-ios-foreground-muted leading-relaxed mt-0.5">
                        {a.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
