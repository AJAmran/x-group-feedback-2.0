"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/**
 * Styled text input for admin forms. Wraps the ledger-style `.squircle-input`
 * so all dashboard inputs share a single look.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "squircle-input w-full",
        invalid && "!border-[oklch(var(--lacquer)/0.55)] focus:!border-[oklch(var(--lacquer))]",
        className,
      )}
      aria-invalid={invalid ? "true" : undefined}
      {...props}
    />
  ),
);
TextInput.displayName = "TextInput";
