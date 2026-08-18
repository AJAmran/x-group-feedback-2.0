import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardHeaderProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  count?: number;
  action?: React.ReactNode;
  /** "bordered" (table/panel header, bottom rule) or "inset" (inside-card section header). */
  variant?: "bordered" | "inset";
  className?: string;
}

/** Consistent card header: icon tile, title, optional hint/count/action. */
export function CardHeader({
  icon: Icon,
  title,
  hint,
  count,
  action,
  variant = "bordered",
  className = "",
}: CardHeaderProps) {
  const inset = variant === "inset";
  return (
    <div
      className={cn(
        inset
          ? "flex items-start justify-between gap-3 mb-5"
          : "px-5 py-3.5 border-b border-ios-border-subtle flex items-center justify-between gap-3",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={cn(
            "icon-tile-sm",
            inset
              ? "bg-xg-secondary-soft border-xg-secondary/20 text-xg-secondary"
              : "bg-ios-primary/[0.07] border-ios-primary/10 text-ios-primary",
          )}
        >
          <Icon size={15} strokeWidth={2.1} />
        </div>
        <div className="min-w-0">
          <h3 className={cn("truncate", inset ? "text-label font-bold text-ios-foreground leading-none" : "card-heading")}>
            {title}
          </h3>
          {hint && <p className="text-micro text-ios-foreground-faint mt-1">{hint}</p>}
        </div>
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
