import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/features/auth/actions";
import { getBranchPerformance } from "@/features/dashboard/actions";
import { BranchGridView } from "./_components/branch-grid";
import { BranchLeaderboard } from "./_components/branch-leaderboard";

async function BranchContent() {
  const user = await getCurrentUserAction();
  if (user?.role === "BRANCH_MANAGER") redirect("/dashboard");
  const branches = await getBranchPerformance();
  const sorted = [...branches].sort((a, b) => b.healthScore - a.healthScore);
  const best = sorted.slice(0, 3);
  const worst = sorted.filter((b) => b.healthScore < 50).slice(0, 3);

  return (
    <>
      {/* Leaderboard */}
      <BranchLeaderboard branches={sorted} />

      {/* Best & Worst Branches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="text-label font-bold text-ios-foreground mb-4 uppercase tracking-[0.12em]">Best Branches</h3>
          <div className="space-y-3">
            {best.map((b, i) => (
              <div key={b.code} className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-micro font-bold text-emerald-600 dark:text-emerald-400">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-label font-semibold text-ios-foreground">{b.name}</p>
                    <p className="text-micro text-ios-foreground-faint">{b.totalFeedback} reviews</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-label font-bold text-ios-foreground">{b.averageRating.toFixed(1)}</p>
                  <p className="text-micro text-ios-foreground-faint">Score: {b.healthScore}</p>
                </div>
              </div>
            ))}
            {best.length === 0 && (
              <p className="text-caption text-ios-foreground-faint text-center py-4">No data yet</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl">
          <h3 className="text-label font-bold text-ios-foreground mb-4 uppercase tracking-[0.12em]">Needs Attention</h3>
          <div className="space-y-3">
            {worst.length > 0 ? worst.map((b, i) => (
              <div key={b.code} className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-micro font-bold text-red-600 dark:text-red-400">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-label font-semibold text-ios-foreground">{b.name}</p>
                    <p className="text-micro text-ios-foreground-faint">{b.totalFeedback} reviews</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-label font-bold text-ios-foreground">{b.averageRating.toFixed(1)}</p>
                  <p className="text-micro text-ios-foreground-faint">Score: {b.healthScore}</p>
                </div>
              </div>
            )) : (
              <p className="text-caption text-ios-foreground-faint text-center py-4">All branches are performing well</p>
            )}
          </div>
        </div>
      </div>

      {/* Grid View */}
      <div className="mt-8">
        <h3 className="text-label font-bold text-ios-foreground mb-4 uppercase tracking-[0.12em]">All Branches</h3>
        <BranchGridView branches={sorted} />
      </div>
    </>
  );
}

export default function BranchesPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Branch Performance</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">Performance metrics for all X-Group branches</p>
      </div>

      <Suspense fallback={
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl animate-pulse">
            <div className="h-64 bg-ios-border-subtle rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="glass-card p-6 rounded-3xl animate-pulse">
                <div className="h-4 w-24 bg-ios-border-subtle rounded mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => <div key={j} className="h-12 bg-ios-border-subtle rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      }>
        <BranchContent />
      </Suspense>
    </div>
  );
}
