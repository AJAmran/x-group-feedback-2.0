import { Lightbulb, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { getInsights, getAlertsData } from "@/features/dashboard/actions";
import { cn } from "@/lib/utils";

interface Insight {
  type: "positive" | "negative" | "neutral";
  message: string;
}

interface Alert {
  severity: "critical" | "info";
  title: string;
  message: string;
}

const INSIGHT_META = {
  positive: {
    icon: Lightbulb,
    tint: "bg-xg-positive-soft border-xg-positive/25 text-xg-positive",
    label: "Insight",
  },
  neutral: {
    icon: Info,
    tint: "bg-xg-primary-soft border-xg-primary/25 text-xg-primary",
    label: "Note",
  },
  negative: {
    icon: AlertTriangle,
    tint: "bg-xg-warning-soft border-xg-warning/30 text-xg-warning",
    label: "Watch",
  },
} as const;

function InsightPanel({ items }: { items: Insight[] }) {
  if (items.length === 0) {
    return (
      <div className="glass-card p-6 h-full card-lift flex flex-col items-center justify-center text-center">
        <div className="w-11 h-11 rounded-2xl bg-xg-primary-soft border border-xg-primary/20 flex items-center justify-center mb-3">
          <Lightbulb size={18} className="text-xg-primary" />
        </div>
        <p className="text-label font-semibold text-ios-foreground">Not enough data for insights yet</p>
        <p className="text-micro text-ios-foreground-faint mt-1 max-w-xs">
          Insights will appear once sufficient feedback is collected for the selected period.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 h-full card-lift">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="icon-tile bg-xg-primary-soft border-xg-primary/25 flex items-center justify-center">
          <Lightbulb size={16} className="text-xg-primary" strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="text-label font-bold text-ios-foreground leading-none">Intelligence & Insights</h2>
          <p className="text-[0.6875rem] text-ios-foreground-faint mt-1">Automated analysis from feedback data</p>
        </div>
      </div>
      <ul className="space-y-3">
        {items.map((insight, i) => {
          const meta = INSIGHT_META[insight.type];
          const Icon = meta.icon;
          return (
            <li key={i} className="flex items-start gap-3 p-4 rounded-2xl border border-ios-border-subtle bg-surface-200/70">
              <div className={cn("icon-tile-sm", meta.tint)}>
                <Icon size={15} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 pt-0.5">
                <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[0.625rem] font-bold uppercase tracking-wider border", meta.tint)}>
                  {meta.label}
                </span>
                <p className="text-label font-medium text-ios-foreground leading-relaxed mt-1.5">{insight.message}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AlertPanel({ items }: { items: Alert[] }) {
  const hasCritical = items.some((a) => a.severity === "critical");

  return (
    <div className="glass-card p-6 h-full card-lift">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="icon-tile bg-xg-positive-soft border-xg-positive/25 flex items-center justify-center">
          <ShieldCheck size={16} className="text-xg-positive" strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <h2 className="text-label font-bold text-ios-foreground leading-none">Alerts</h2>
          <p className="text-[0.6875rem] text-ios-foreground-faint mt-1">System health & attention items</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.6875rem] font-bold border",
            hasCritical
              ? "bg-xg-warning-soft text-xg-warning border-xg-warning/30"
              : "bg-xg-positive-soft text-xg-positive border-xg-positive/25",
          )}
        >
          <span className={cn("relative flex w-1.5 h-1.5", !hasCritical && "bg-transparent")} aria-hidden="true">
            {!hasCritical && <span className="absolute inline-flex h-full w-full rounded-full bg-xg-positive opacity-75 animate-ping" />}
            <span className={cn("relative inline-flex w-1.5 h-1.5 rounded-full", hasCritical ? "bg-xg-warning" : "bg-xg-positive")} />
          </span>
          {hasCritical ? "Attention" : "Active"}
        </span>
      </div>

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="p-4 rounded-2xl border border-ios-border-subtle bg-surface-200/70 text-center">
            <p className="text-label font-semibold text-ios-foreground">All clear</p>
            <p className="text-micro text-ios-foreground-faint mt-1">Everything looks healthy.</p>
          </li>
        ) : (
          items.map((alert, i) => (
            <li
              key={i}
              className={cn(
                "flex items-start gap-3 p-4 rounded-2xl border",
                alert.severity === "critical"
                  ? "bg-xg-negative-soft border-xg-negative/25"
                  : "bg-xg-positive-soft/70 border-xg-positive/20",
              )}
            >
              <span
                aria-hidden="true"
                className={cn("mt-1 w-2 h-2 rounded-full shrink-0", alert.severity === "critical" ? "bg-xg-negative" : "bg-xg-positive")}
              />
              <div className="min-w-0">
                <h3 className="text-label font-bold text-ios-foreground">{alert.title}</h3>
                <p className="text-micro text-ios-foreground-muted leading-relaxed mt-0.5">{alert.message}</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export async function InsightsAlerts({ dateFrom, dateTo, branchId }: { dateFrom?: string; dateTo?: string; branchId?: string }) {
  const [insights, alerts] = await Promise.all([
    getInsights(dateFrom, dateTo, branchId),
    getAlertsData(dateFrom, dateTo, branchId),
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <InsightPanel items={insights as Insight[]} />
      <AlertPanel items={alerts as Alert[]} />
    </div>
  );
}