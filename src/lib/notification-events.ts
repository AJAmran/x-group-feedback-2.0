type NotificationListener = () => void;

const listeners = new Set<NotificationListener>();

/**
 * Tiny module-level pub/sub so the single SSE connection owned by
 * `RealtimeSync` can wake up the notification bell when a `notification.created`
 * event arrives — without opening a second connection.
 */
export function onNotificationCreated(listener: NotificationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitNotificationCreated(): void {
  listeners.forEach((listener) => listener());
}
