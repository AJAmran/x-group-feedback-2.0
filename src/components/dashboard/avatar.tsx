import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "w-8 h-8 rounded-lg text-micro",
  md: "w-10 h-10 rounded-xl text-caption",
  lg: "w-12 h-12 rounded-2xl text-body",
};

/** Initials avatar with the brand navy→gold gradient treatment. */
export function Avatar({ name, size = "sm", className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={cn(
        "bg-linear-to-br from-ios-primary to-ios-accent flex items-center justify-center shrink-0 shadow-sm",
        SIZE_CLASS[size],
        className,
      )}
      aria-hidden="true"
    >
      <span className="font-extrabold text-ios-on-primary">{initials}</span>
    </div>
  );
}