import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FilterBarShellProps {
  title?: string;
  description?: string;
  activeCount?: number;
  onClearAll?: () => void;
  children: React.ReactNode;
  className?: string;
}

/** Shared filter-bar card: icon + title header with active count / clear, body = controls. */
export function FilterBarShell({
  title = "Filters",
  description = "Refine the metrics below",
  activeCount = 0,
  onClearAll,
  children,
  className,
}: FilterBarShellProps) {
  return (
    <div className={cn("glass-card overflow-hidden", className)}>
      <div className="px-5 py-3.5 border-b border-ios-border-subtle flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="icon-tile-sm bg-ios-primary/[0.07] border-ios-primary/10 text-ios-primary">
            <SlidersHorizontal size={15} />
          </div>
          <div className="min-w-0">
            <p className="card-heading truncate">{title}</p>
            {description && <p className="text-micro text-ios-foreground-faint mt-1">{description}</p>}
          </div>
          {activeCount > 0 && (
            <span className="text-micro font-bold text-ios-primary bg-ios-primary/10 px-2 py-0.5 rounded-full border border-ios-primary/15 shrink-0">
              {activeCount} active
            </span>
          )}
        </div>
        {onClearAll && activeCount > 0 && (
          <Button variant="ghost-red" size="sm" icon={X} onClick={onClearAll}>
            Clear all
          </Button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
