"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const REFRESH_DEBOUNCE_MS = 1000;
// Minimum gap between refresh() calls. Coalesces bursts of SSE events into a
// single re-fetch so a flood of new feedback doesn't hammer the server.
const MIN_REFRESH_INTERVAL_MS = 10000;

/**
 * Real-time dashboard sync via Server-Sent Events.
 *
 * Subscribes to the SSE proxy (`/api/realtime/stream`), which is an
 * authenticated pipe to the backend's realtime event hub. Whenever a
 * `data.*` event arrives, the current route's server components are
 * re-fetched with `router.refresh()` — no manual page reload, and existing
 * client state (filters, open tabs) is preserved.
 *
 * Reconnect handling:
 *  - EventSource auto-reconnects; on every (re)connect we refresh once to
 *    catch anything missed while disconnected.
 *  - When the tab regains focus/visibility we refresh once (browsers throttle
 *    background tabs, so events may have been dropped).
 *  - Events are debounced AND throttled to coalesce bursts into a single
 *    refresh while guaranteeing at most one refresh per MIN_REFRESH_INTERVAL.
 */
export function RealtimeSync({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshAt = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef(false);
  const wasConnectedRef = useRef(false);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) return;

    const now = Date.now();
    const wait = Math.max(REFRESH_DEBOUNCE_MS, lastRefreshAt.current + MIN_REFRESH_INTERVAL_MS - now);

    refreshTimer.current = setTimeout(() => {
      refreshTimer.current = null;
      lastRefreshAt.current = Date.now();
      router.refresh();
    }, wait);
  }, [router]);

  // Catch-up refresh when the tab becomes visible again.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") scheduleRefresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [scheduleRefresh]);

  useEffect(() => {
    let mounted = true;

    const connect = () => {
      if (!mounted) return;
      const es = new EventSource("/api/realtime/stream");
      eventSourceRef.current = es;

      es.onopen = () => {
        if (!mounted) return;
        setConnected(true);
        // Refresh once after a reconnect to fill any gap while offline.
        if (wasConnectedRef.current && reconnectRef.current) scheduleRefresh();
        wasConnectedRef.current = true;
      };

      es.onerror = () => {
        // EventSource will auto-reconnect; mark disconnected in the meantime.
        setConnected(false);
        reconnectRef.current = true;
      };

      es.onmessage = (event) => {
        if (!mounted) return;
        try {
          const data = JSON.parse(event.data) as { entity?: string };
          if (data.entity && data.entity !== "ping") scheduleRefresh();
        } catch {
          // Malformed frame — ignore.
        }
      };
    };

    connect();

    return () => {
      mounted = false;
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [scheduleRefresh]);

  // When the document loads, surface the connection state to the console for
  // easy debugging in dev (no visual noise).
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && connected) {
      console.info("[realtime] connected");
    }
  }, [connected]);

  return <>{children}</>;
}