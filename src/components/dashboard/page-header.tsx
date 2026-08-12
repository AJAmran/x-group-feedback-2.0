import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-x-6 gap-y-3">
      <div className="flex items-center gap-3.5 min-w-0">
        {Icon && (
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-ios-primary/[0.08] border border-ios-primary/15 items-center justify-center shrink-0">
            <Icon size={20} className="text-ios-primary" strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-display font-bold text-ios-foreground tracking-tight font-display leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-subtitle font-semibold text-ios-foreground-muted mt-1.5">{subtitle}</p>
          )}
          {description && (
            <p className="text-caption text-ios-foreground-faint mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
