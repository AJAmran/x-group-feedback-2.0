import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-ios-primary/8 border border-ios-primary/12 flex items-center justify-center mb-4">
        <Icon size={24} className="text-ios-primary/70" strokeWidth={1.75} />
      </div>
      <p className="text-label font-semibold text-ios-foreground mb-1">{title}</p>
      {description && (
        <p className="text-caption text-ios-foreground-faint max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
