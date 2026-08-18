import { MessageSquare, TrendingUp, CalendarDays, CalendarCheck, Star } from "lucide-react";
import type { getDashboardStats } from "@/features/dashboard/actions";

type Stats = Awaited<ReturnType<typeof getDashboardStats>>;

interface SupportingMetric {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  subtext?: string;
  tint: string;
  progress?: number;
  progressBar?: string;
  caption?: string;
}

function MetricTile({ label, value, icon: Icon, subtext, tint, progress, progressBar, caption }: SupportingMetric) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="card-heading truncate">{label}</p>
        <div className={`icon-tile-sm ${tint}`}>
          <Icon size={14} strokeWidth={2.2} />
        </div>
      </div>
      <p className="stat-value mt-2.5">{value}</p>
      {caption && (
        <p className="card-subheading mt-1">{caption}</p>
      )}
      {typeof progress === "number" && (
        <div className="mt-2.5 h-1.5 w-full rounded-full bg-ios-border-subtle/60 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full rounded-full transition-[width] duration-500 ${progressBar}`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      )}
      {subtext && (
        <p className="meta-caption mt-1.5">{subtext}</p>
      )}
    </div>
  );
}

export async function SupportingMetrics({ stats }: { stats: Stats }) {
  const metrics: SupportingMetric[] = [
    {
      label: "Total Feedback",
      value: stats.totalFeedback,
      icon: MessageSquare,
      tint: "bg-xg-primary-soft border-xg-primary/25 text-xg-primary",
      caption: "In the selected period",
    },
    {
      label: "Feedback Today",
      value: stats.feedbackToday,
      icon: TrendingUp,
      tint: "bg-xg-positive-soft border-xg-positive/25 text-xg-positive",
      caption: "Leveled for the week",
    },
    {
      label: "Feedback This Week",
      value: stats.feedbackThisWeek,
      icon: CalendarDays,
      tint: "bg-xg-secondary-soft border-xg-secondary/30 text-xg-secondary",
      caption: "Since Monday",
    },
    {
      label: "Feedback This Month",
      value: stats.feedbackThisMonth,
      icon: CalendarCheck,
      tint: "bg-xg-primary-soft border-xg-primary/25 text-xg-primary",
      caption: "Since the 1st",
    },
    {
      label: "Average Rating",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      tint: "bg-xg-warning-soft border-xg-warning/30 text-xg-warning",
      caption: `${stats.averageRating.toFixed(1)} / 5`,
      progress: (stats.averageRating / 5) * 100,
      progressBar: "bg-linear-to-r from-xg-warning to-[oklch(72%_0.15_85)]",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {metrics.map((m) => (
        <MetricTile key={m.label} {...m} />
      ))}
    </div>
  );
}