type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClass: Record<StatusVariant, string> = {
  success: "status-success",
  warning: "status-warning",
  danger: "status-danger",
  info: "status-info",
  neutral: "status-neutral",
};

export function StatusBadge({ variant, children, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider border transition-colors duration-200 ${variantClass[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
