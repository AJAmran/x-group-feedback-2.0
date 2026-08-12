// ── Shared skeleton primitives for all dashboard loading.tsx files ──

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
    <div className="rounded-2xl border border-ios-border-subtle bg-surface-300 shadow-sm p-5">
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
        <div key={i} className="glass-card p-5 rounded-3xl">
          <Bone className="h-4 w-3/4" />
          <Bone className="h-3 w-1/2 mt-2" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="px-5 py-4 border-b border-ios-border-subtle flex items-center justify-between">
        <Bone className="h-4 w-32" />
        <Bone className="h-7 w-20 rounded-lg" />
      </div>
      <div className="p-8 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-ios-border-subtle/60 rounded-xl skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}

export function ChartCardSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl">
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
    <div className="glass-card p-5 rounded-3xl">
      {children}
    </div>
  );
}
