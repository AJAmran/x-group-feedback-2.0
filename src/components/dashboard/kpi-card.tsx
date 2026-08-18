import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CARD_ACCENTS, type CardAccent } from "@/components/dashboard/card-accent";

type KpiAccent = CardAccent;

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: KpiAccent;
  trend?: "up" | "down" | "neutral" | string;
  change?: string;
  subtext?: string;
  /** Optional 0–100 progress indicator (e.g. rating/5 or percentage share). */
  progress?: number;
}

const trendMetaMap = {
  up: { icon: TrendingUp, cls: "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  down: { icon: TrendingDown, cls: "text-red-600 dark:text-red-400 border-red-500/20 bg-red-500/10" },
  neutral: { icon: Minus, cls: "text-ios-foreground-subtle border-ios-border-subtle bg-ios-border-subtle/50" },
} as const;

export function KpiCard({
  title,
  value,
  icon: Icon,
  accent = "navy",
  trend,
  change,
  subtext,
  progress,
}: KpiCardProps) {
  const a = CARD_ACCENTS[accent];

  const trendMeta =
    trend === "up" || trend === "down" || trend === "neutral" ? trendMetaMap[trend] : null;

  return (
    <div className="group glass-card p-5 transition-all duration-200 hover:shadow-md hover:border-ios-border flex flex-col card-lift">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={`icon-tile-lg transition-colors duration-200 group-hover:scale-[1.04] ${a.tile}`}
        >
          <Icon size={18} strokeWidth={2.25} />
        </div>
        {trendMeta && change && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-micro font-bold uppercase tracking-wider border ${trendMeta.cls}`}
          >
            <trendMeta.icon size={11} strokeWidth={2.5} />
            {change}
          </span>
        )}
      </div>

      <p className="stat-kicker">{title}</p>
      <p className="stat-value mt-2">{value}</p>

      {typeof progress === "number" && (
        <div
          className="mt-4 h-1.5 w-full rounded-full bg-ios-border-subtle/60 overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${a.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {subtext && (
        <p className="meta-caption mt-2.5">{subtext}</p>
      )}
    </div>
  );
}