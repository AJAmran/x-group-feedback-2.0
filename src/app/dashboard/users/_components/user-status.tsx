import { cn } from "@/lib/utils";

interface UserStatusProps {
  active: boolean;
  className?: string;
}

/**
 * Compact user status indicator. Uses the design system's semantic status
 * colors plus a filled dot so status is never communicated by color alone.
 */
export function UserStatus({ active, className }: UserStatusProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-micro font-semibold border whitespace-nowrap",
        active ? "status-success" : "status-neutral",
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
