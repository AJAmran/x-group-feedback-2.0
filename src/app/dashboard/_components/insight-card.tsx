import { Lightbulb, AlertTriangle, Info } from "lucide-react";

interface InsightCardProps {
  type: "positive" | "negative" | "neutral";
  message: string;
}

export function InsightCard({ type, message }: InsightCardProps) {
  const config = {
    positive: {
      bg: "bg-emerald-500/10 border-emerald-500/20",
      icon: Lightbulb,
      iconBg: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    },
    negative: {
      bg: "bg-red-500/10 border-red-500/20",
      icon: AlertTriangle,
      iconBg: "bg-red-500/20 text-red-600 dark:text-red-400",
    },
    neutral: {
      bg: "bg-ios-primary/10 border-ios-primary/20",
      icon: Info,
      iconBg: "bg-ios-primary/20 text-ios-primary",
    },
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <div className={`glass-card p-4 rounded-[1.25rem] border ${c.bg}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={16} />
        </div>
        <p className="text-label font-semibold text-ios-foreground leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
