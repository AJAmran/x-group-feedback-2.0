import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Label + hint + error wrapper for admin form controls.
 * Errors are announced to assistive technology via aria-live.
 */
export function FormField({ label, hint, error, required, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-caption font-semibold text-ios-foreground-muted">
          {label}
          {required && (
            <span className="text-[oklch(var(--lacquer))] ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-caption font-medium text-[oklch(var(--lacquer))]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-micro text-ios-foreground-faint font-medium">{hint}</p>
      ) : null}
    </div>
  );
}
