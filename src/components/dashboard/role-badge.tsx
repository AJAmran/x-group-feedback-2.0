import { getRoleMeta } from "@/lib/roles";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

/** Badge showing a user role with its icon and brand-appropriate colors. */
export function RoleBadge({ role, className }: RoleBadgeProps) {
  const meta = getRoleMeta(role);
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider border",
        meta.badge,
        className,
      )}
    >
      <Icon size={12} />
      {meta.shortLabel}
    </span>
  );
}