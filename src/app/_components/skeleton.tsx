// ── Shared skeleton primitives for all dashboard loading.tsx files ──

export function Bone({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-ios-border-subtle animate-pulse rounded-(--radius-ios-sm) ${className}`}
    />
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="glass-card p-5 rounded-3xl">
      <Bone className="w-10 h-10 rounded-xl mb-3" />
      <Bone className="h-3 w-20 mb-2" />
      <Bone className="h-8 w-28" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="px-5 py-4 border-b border-ios-border-subtle">
        <Bone className="h-4 w-32" />
      </div>
      <div className="p-8 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-ios-border-subtle rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ChartCardSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className="glass-card p-6 rounded-[1.5rem]">
      <Bone className="h-4 w-32 mb-6" />
      <div className={`${height} bg-ios-border-subtle rounded-xl`} />
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
