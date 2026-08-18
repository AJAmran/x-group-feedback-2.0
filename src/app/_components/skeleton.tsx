// ── Shared skeleton primitives for all dashboard loading.tsx files ──

const ROW_DELAYS = [
  "[animation-delay:0ms]",
  "[animation-delay:120ms]",
  "[animation-delay:240ms]",
  "[animation-delay:360ms]",
  "[animation-delay:480ms]",
  "[animation-delay:600ms]",
];

export function Bone({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer rounded-(--radius-ios-sm) ${className}`}
    />
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-start gap-4 pb-1">
      <Bone className="hidden sm:block w-11 h-11 rounded-xl" />
      <div className="flex-1 min-w-0">
        <Bone className="h-8 w-56 mb-2" />
        <Bone className="h-4 w-80 max-w-full" />
      </div>
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-4">
        <Bone className="w-10 h-10 rounded-xl" />
        <Bone className="w-14 h-5 rounded-lg" />
      </div>
      <Bone className="h-3 w-24 mb-2" />
      <Bone className="h-8 w-28" />
      <Bone className="h-1.5 w-full rounded-full mt-4" />
      <Bone className="h-3 w-32 mt-2.5" />
    </div>
  );
}

export function ListCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass-card p-5">
          <Bone className="h-4 w-3/4" />
          <Bone className="h-3 w-1/2 mt-2" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-ios-border-subtle flex items-center justify-between">
        <Bone className="h-4 w-32" />
        <Bone className="h-7 w-20 rounded-lg" />
      </div>
      <div className="p-8 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`h-12 rounded-xl skeleton-shimmer ${ROW_DELAYS[i % ROW_DELAYS.length]}`}
          />
        ))}
      </div>
    </div>
  );
}

export function ChartCardSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className="glass-card p-6">
      <Bone className="h-4 w-32 mb-6" />
      <div className={`${height} skeleton-shimmer rounded-xl`} />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-ios-background flex items-center justify-center" aria-label="Loading dashboard…" aria-busy="true">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-ios-primary/10 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-ios-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-caption font-medium text-ios-foreground-subtle">Loading dashboard…</p>
      </div>
    </div>
  );
}

export function CardSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <div className="glass-card p-5">
      {children}
    </div>
  );
}

// ── Daily Operations skeletons ───────────────────────────────────────────────

/** Skeleton that mirrors OpsStatCard (label + icon tile + value + subtext). */
export function OpsStatCardSkeleton() {
  return (
    <div className="relative overflow-hidden glass-card p-5">
      <div className="relative flex items-start justify-between gap-3">
        <Bone className="h-3 w-24 rounded-lg" />
        <Bone className="w-9 h-9 rounded-lg" />
      </div>
      <div className="relative mt-3.5">
        <Bone className="h-7 w-24 rounded-lg" />
      </div>
      <div className="relative mt-2.5">
        <Bone className="h-2.5 w-32 rounded-full" />
      </div>
    </div>
  );
}

/** Row of Ops stat-card skeletons — pass the same grid cols as the live layout. */
export function StatsGridSkeleton({ count = 4, cols = "lg:grid-cols-4" }: { count?: number; cols?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <OpsStatCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for a filter/action toolbar (input + button placeholders). */
export function ToolbarSkeleton({ inputs = 2, actions = 2 }: { inputs?: number; actions?: number }) {
  return (
    <div className="glass-card px-5 py-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {Array.from({ length: inputs }).map((_, i) => (
          <Bone key={i} className="h-10 w-40 rounded-xl" />
        ))}
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: actions }).map((_, i) => (
          <Bone key={i} className="h-10 w-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

const TABLE_HEADER_BONES = ["w-12", "w-16", "w-14", "w-20", "w-12", "w-16", "w-14", "w-20", "w-12", "w-16"];
const TABLE_ROW_BONES = ["w-28", "w-20", "w-24", "w-32", "w-16", "w-24"];

/** Skeleton for a card-hosted data table: card header, column header, mirroring rows. */
export function TableCardSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-ios-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Bone className="w-8 h-8 rounded-lg" />
          <Bone className="h-4 w-44" />
        </div>
        <Bone className="h-6 w-16 rounded-full" />
      </div>
      <div className="hidden md:flex items-center gap-4 px-4 py-3 border-b border-ios-border-subtle">
        {Array.from({ length: columns }).map((_, i) => (
          <Bone key={i} className={`h-2.5 shrink-0 ${TABLE_HEADER_BONES[i % TABLE_HEADER_BONES.length]}`} />
        ))}
      </div>
      <div className="divide-y divide-ios-border-subtle">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Bone className={`h-4 w-28 shrink-0 ${ROW_DELAYS[i % ROW_DELAYS.length]}`} />
            <Bone className={`h-4 shrink-0 ${TABLE_ROW_BONES[(i + 1) % TABLE_ROW_BONES.length]} ${ROW_DELAYS[(i + 1) % ROW_DELAYS.length]}`} />
            <Bone className={`h-4 w-20 shrink-0 hidden sm:block ${ROW_DELAYS[(i + 2) % ROW_DELAYS.length]}`} />
            <Bone className={`h-4 flex-1 ${ROW_DELAYS[(i + 3) % ROW_DELAYS.length]}`} />
            <Bone className={`h-7 w-24 shrink-0 rounded-lg ${ROW_DELAYS[(i + 4) % ROW_DELAYS.length]}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
