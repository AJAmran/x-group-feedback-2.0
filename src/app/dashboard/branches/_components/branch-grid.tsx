interface BranchData {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  totalFeedback: number;
  averageRating: number;
  positivePercentage: number;
  negativePercentage: number;
  monthlyTrend: number;
  healthScore: number;
}

interface BranchGridViewProps {
  branches: BranchData[];
}

export function BranchGridView({ branches }: BranchGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {branches.map((branch) => (
        <div key={branch.code} className="glass-card p-5 rounded-[1.5rem]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-label font-semibold text-ios-foreground">{branch.name}</p>
              <p className="text-micro text-ios-foreground-faint font-medium">{branch.code}</p>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider ${
              branch.healthScore >= 70 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
              branch.healthScore >= 40 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
              "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}>
              {branch.healthScore}
            </div>
          </div>

          <div className="flex items-end justify-between mt-4">
            <div>
              <p className="text-title font-extrabold text-ios-foreground tracking-tight">
                {branch.averageRating.toFixed(1)}
              </p>
              <p className="text-micro text-ios-foreground-faint font-medium">avg rating</p>
            </div>
            <div className="text-right">
              <p className="text-label font-bold text-ios-foreground">{branch.totalFeedback}</p>
              <p className="text-micro text-ios-foreground-faint font-medium">reviews</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-micro font-medium">
              <span className="text-ios-foreground-subtle">Positive</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{branch.positivePercentage}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-ios-border-subtle overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${branch.positivePercentage}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
