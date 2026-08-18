import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export function SectionHeader({ title, description, icon: Icon, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <div className="icon-tile-sm bg-ios-primary/[0.07] border-ios-primary/10 text-ios-primary">
            <Icon size={15} strokeWidth={2.1} />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-label font-bold text-ios-foreground tracking-tight leading-none">{title}</h2>
          {description && (
            <p className="text-micro text-ios-foreground-faint mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}