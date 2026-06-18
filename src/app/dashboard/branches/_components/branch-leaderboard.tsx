interface BranchData {
  code: string;
  name: string;
  totalFeedback: number;
  averageRating: number;
  positivePercentage: number;
  negativePercentage: number;
  monthlyTrend: number;
  healthScore: number;
}

interface BranchLeaderboardProps {
  branches: BranchData[];
}

export function BranchLeaderboard({ branches }: BranchLeaderboardProps) {
  return (
    <div className="glass-card rounded-[1.5rem] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ios-border-subtle">
              <th className="text-left px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Rank</th>
              <th className="text-left px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Branch</th>
              <th className="text-center px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Avg Rating</th>
              <th className="text-center px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Reviews</th>
              <th className="text-center px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Positive %</th>
              <th className="text-center px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Monthly Trend</th>
              <th className="text-center px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Health Score</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch, i) => (
              <tr key={branch.code} className="border-b border-ios-border-subtle last:border-0 hover:bg-ios-border-subtle/50 transition-colors">
                <td className="px-4 py-3.5">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-micro font-bold ${
                    i === 0 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                    i === 1 ? "bg-slate-400/20 text-slate-600 dark:text-slate-400" :
                    i === 2 ? "bg-orange-500/20 text-orange-600 dark:text-orange-400" :
                    "bg-ios-border-subtle text-ios-foreground-subtle"
                  }`}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div>
                    <p className="text-label font-semibold text-ios-foreground">{branch.name}</p>
                    <p className="text-micro text-ios-foreground-faint">{branch.code}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="text-label font-bold text-ios-foreground">{branch.averageRating.toFixed(1)}</span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="text-label font-semibold text-ios-foreground-muted">{branch.totalFeedback}</span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`text-label font-bold ${
                    branch.positivePercentage >= 70 ? "text-emerald-600 dark:text-emerald-400" :
                    branch.positivePercentage >= 40 ? "text-amber-600 dark:text-amber-400" :
                    "text-red-600 dark:text-red-400"
                  }`}>
                    {branch.positivePercentage}%
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`text-label font-bold ${
                    branch.monthlyTrend >= 4 ? "text-emerald-600 dark:text-emerald-400" :
                    branch.monthlyTrend >= 3 ? "text-amber-600 dark:text-amber-400" :
                    "text-red-600 dark:text-red-400"
                  }`}>
                    {branch.monthlyTrend.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider ${
                    branch.healthScore >= 70 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                    branch.healthScore >= 40 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                    "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}>
                    {branch.healthScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
