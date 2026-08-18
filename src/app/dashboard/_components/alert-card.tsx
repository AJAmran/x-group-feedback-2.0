import { AlertCircle, AlertTriangle, AlertOctagon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AlertCardProps {
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
}

const config: Record<
  AlertCardProps["severity"],
  {
    icon: LucideIcon;
    variant: "danger" | "warning" | "info";
    accent: string;
    iconWrap: string;
  }
> = {
  critical: {
    icon: AlertOctagon,
    variant: "danger",
    accent: "bg-[oklch(var(--lacquer))]",
    iconWrap: "bg-[oklch(var(--lacquer)/0.14)] text-[oklch(var(--lacquer))]",
  },
  warning: {
    icon: AlertTriangle,
    variant: "warning",
    accent: "bg-[oklch(52%_0.14_75)]",
    iconWrap: "bg-[oklch(52%_0.14_75/0.14)] text-[oklch(52%_0.14_75)]",
  },
  info: {
    icon: AlertCircle,
    variant: "info",
    accent: "bg-ios-primary",
    iconWrap: "bg-ios-primary/14 text-ios-primary",
  },
};

export function AlertCard({ severity, title, message }: AlertCardProps) {
  const c = config[severity];
  const Icon = c.icon;

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${c.accent}`} aria-hidden="true" />
      <div className="flex items-start gap-3 pl-1.5">
        <div
          className={`icon-tile border-current/20 ${c.iconWrap}`}
        >
          <Icon size={17} strokeWidth={2.25} />
        </div>
        <div className="pt-0.5">
          <h3 className="text-label font-bold text-ios-foreground mb-0.5">{title}</h3>
          <p className="text-caption text-ios-foreground-muted leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}
