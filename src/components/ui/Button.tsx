"use client";

import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "ghost-green" | "ghost-red" | "outline" | "icon";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ComponentType<{ size?: number }>;
  iconPosition?: "left" | "right";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "btn-ios",
  secondary: "btn-ios-secondary",
  danger: "btn-ios btn-ios-danger",
  ghost: "bg-ios-primary/10 text-ios-primary hover:bg-ios-primary/20 transition-colors",
  "ghost-green": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors",
  "ghost-red": "text-ios-foreground-subtle hover:text-red-500 hover:bg-red-500/10 transition-colors",
  outline: "border border-ios-border-subtle text-ios-foreground-subtle hover:bg-ios-border-subtle transition-colors",
  icon: "rounded-lg hover:bg-ios-border-subtle text-ios-foreground-subtle transition-colors",
};

const sizeStyles: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: { sm: "h-10 px-4 text-micro", md: "h-12 px-6 text-label", lg: "h-14 px-8 text-body" },
  secondary: { sm: "h-9 px-3 text-micro", md: "h-11 px-5 text-label", lg: "h-13 px-7 text-body" },
  danger: { sm: "h-10 px-4 text-micro", md: "h-12 px-6 text-label", lg: "h-14 px-8 text-body" },
  ghost: { sm: "px-2.5 py-1.5 text-micro rounded-lg", md: "px-3.5 py-2 text-caption rounded-xl", lg: "px-5 py-2.5 text-label rounded-xl" },
  "ghost-green": { sm: "px-2.5 py-1.5 text-micro rounded-lg", md: "px-3.5 py-2 text-caption rounded-xl", lg: "px-5 py-2.5 text-label rounded-xl" },
  "ghost-red": { sm: "px-2.5 py-1.5 text-micro rounded-lg", md: "px-3.5 py-2 text-caption rounded-xl", lg: "px-5 py-2.5 text-label rounded-xl" },
  outline: { sm: "h-9 px-3 text-micro rounded-lg", md: "h-11 px-5 text-label rounded-xl", lg: "h-13 px-7 text-body rounded-xl" },
  icon: { sm: "p-1.5", md: "p-2", lg: "p-2.5" },
};

const iconSizes: Record<ButtonSize, number> = { sm: 13, md: 16, lg: 18 };

function hasText(children: React.ReactNode): boolean {
  if (children == null) return false;
  if (typeof children === "string" || typeof children === "number") return true;
  if (Array.isArray(children)) return children.some((c) => hasText(c));
  return true;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isIconOnly = variant !== "icon" && !hasText(children) && !!Icon;

  const base = variantStyles[variant];
  const sizeClass = sizeStyles[variant][size];
  const iconSize = iconSizes[size];

  const disabledClass = isDisabled ? "disabled:opacity-60 disabled:cursor-not-allowed" : "";
  const iconOnlyClass = isIconOnly ? "p-2" : "";

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-bold ${base} ${sizeClass} ${disabledClass} ${iconOnlyClass} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={iconSize} />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon size={iconSize} />}
          {children}
          {Icon && iconPosition === "right" && <Icon size={iconSize} />}
        </>
      )}
    </button>
  );
}
