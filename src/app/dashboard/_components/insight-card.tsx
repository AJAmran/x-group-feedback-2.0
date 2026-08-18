import { Lightbulb, AlertTriangle, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";

interface InsightCardProps {
  type: "positive" | "negative" | "neutral";
  message: string;
}

const config: Record<
  InsightCardProps["type"],
  {
    icon: LucideIcon;
    variant: "success" | "danger" | "info";
    iconWrap: string;
    label: string;
  }
> = {
  positive: {
    icon: Lightbulb,
    variant: "success",
    iconWrap: "bg-[oklch(42%_0.12_155/0.14)] border-[oklch(42%_0.12_155/0.25)] text-[oklch(42%_0.12_155)]",
    label: "Insight",
  },
  negative: {
    icon: AlertTriangle,
    variant: "danger",
    iconWrap: "bg-[oklch(var(--lacquer)/0.14)] border-[oklch(var(--lacquer)/0.25)] text-[oklch(var(--lacquer))]",
    label: "Watch",
  },
  neutral: {
    icon: Info,
    variant: "info",
    iconWrap: "bg-ios-primary/14 border-ios-primary/25 text-ios-primary",
    label: "Note",
  },
};

export function InsightCard({ type, message }: InsightCardProps) {
  const c = config[type];
  const Icon = c.icon;

  return (
    <div className="glass-card p-4 card-interactive">
      <div className="flex items-start gap-3">
        <div
          className={`icon-tile ${c.iconWrap}`}
        >
          <Icon size={17} strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <StatusBadge variant={c.variant} className="mb-1.5">
            {c.label}
          </StatusBadge>
          <p className="text-label font-medium text-ios-foreground leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
