import { Bone, KpiCardSkeleton } from "../_components/skeleton";

function SidebarSkeleton() {
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-surface-200 backdrop-blur-xl border-r border-ios-border-subtle z-30">
      <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-ios-border-subtle">
        <Bone className="h-5 w-24" />
        <Bone className="h-5 w-5" />
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Bone className="h-5 w-5 shrink-0" />
            <Bone className="h-3.5 w-20" />
          </div>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-ios-border-subtle">
        <Bone className="h-2.5 w-36 mx-auto" />
      </div>
    </aside>
  );
}

function TopnavSkeleton() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-ios-border-subtle bg-surface-200/80 backdrop-blur-xl lg:ml-60">
      <div className="flex items-center gap-4">
        <Bone className="h-5 w-5 lg:hidden" />
        <div className="flex items-center gap-2">
          <Bone className="h-3.5 w-16" />
          <Bone className="h-3.5 w-3" />
          <Bone className="h-3.5 w-28" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8 rounded-lg" />
      </div>
    </header>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-ios-background" aria-label="Loading dashboard…" aria-busy="true">
      <SidebarSkeleton />
      <TopnavSkeleton />

      <main className="pt-4 px-4 sm:px-6 lg:px-8 pb-8 lg:ml-60 transition-all duration-300">
        <div className="space-y-8">
          <div>
            <Bone className="h-8 w-56 mb-2" />
            <Bone className="h-4 w-80" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>

          <div>
            <Bone className="h-5 w-44 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-5 rounded-3xl">
                  <Bone className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Bone className="h-5 w-48 mb-4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card h-[400px] rounded-4xl" />
              <div className="grid grid-rows-2 gap-6">
                <div className="glass-card rounded-4xl" />
                <div className="glass-card rounded-4xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
