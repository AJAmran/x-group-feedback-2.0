import { AlertCircle, AlertTriangle, AlertOctagon } from "lucide-react";

interface AlertCardProps {
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
}

export function AlertCard({ severity, title, message }: AlertCardProps) {
  const config = {
    critical: {
      bg: "bg-red-500/10 border-red-500/30",
      icon: AlertOctagon,
      iconBg: "text-red-500",
    },
    warning: {
      bg: "bg-amber-500/10 border-amber-500/30",
      icon: AlertTriangle,
      iconBg: "text-amber-500",
    },
    info: {
      bg: "bg-sky-500/10 border-sky-500/30",
      icon: AlertCircle,
      iconBg: "text-sky-500",
    },
  };

  const c = config[severity];
  const Icon = c.icon;

  return (
    <div className={`p-4 rounded-[1.25rem] border ${c.bg}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={`${c.iconBg} shrink-0 mt-0.5`} />
        <div>
          <p className="text-label font-bold text-ios-foreground mb-0.5">{title}</p>
          <p className="text-caption text-ios-foreground-muted">{message}</p>
        </div>
      </div>
    </div>
  );
}
