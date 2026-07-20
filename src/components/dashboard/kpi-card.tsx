import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral" | string;
  change?: string;
  subtext?: string;
}

export function KpiCard({ title, value, icon: Icon, trend, change, subtext }: KpiCardProps) {
  return (
    <div className="glass-card p-5 rounded-3xl">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-ios-primary/10 flex items-center justify-center">
          <Icon size={20} className="text-ios-primary" />
        </div>
        {trend && (
          <div aria-label={`Trend: ${trend} ${change}`} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-micro font-bold uppercase tracking-wider
            ${trend === "up" ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : ""}
            ${trend === "down" ? "text-red-600 dark:text-red-400 bg-red-500/10" : ""}
            ${trend === "neutral" ? "text-ios-foreground-subtle bg-ios-border-subtle" : ""}
          `}>
            {trend === "up" ? <TrendingUp size={12} /> : trend === "down" ? <TrendingDown size={12} /> : null}
            {change}
          </div>
        )}
      </div>
      <p className="text-caption font-semibold uppercase tracking-[0.12em] text-ios-foreground-subtle mb-1">
        {title}
      </p>
      <p className="text-title font-extrabold text-ios-foreground tracking-tight">
        {value}
      </p>
      {subtext && (
        <p className="text-micro text-ios-foreground-faint font-medium mt-1">{subtext}</p>
      )}
    </div>
  );
}
