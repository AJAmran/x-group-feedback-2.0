import type { LucideIcon } from "lucide-react";

interface CardHeaderProps {
  icon: LucideIcon;
  title: string;
  count?: number;
  action?: React.ReactNode;
  className?: string;
}

/** Consistent table / panel card header: icon, uppercase title, count pill, action. */
export function CardHeader({ icon: Icon, title, count, action, className = "" }: CardHeaderProps) {
  return (
    <div className={`px-5 py-3.5 border-b border-ios-border-subtle flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon size={15} className="text-ios-foreground-subtle shrink-0" />
        <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle truncate">
          {title}
        </span>
        {typeof count === "number" && (
          <span className="text-micro font-medium text-ios-foreground-faint bg-ios-border-subtle/50 px-2 py-0.5 rounded-full shrink-0">
            {count} total
          </span>
        )}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}