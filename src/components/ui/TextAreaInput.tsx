"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/**
 * Styled textarea for admin forms.
 */
export const TextAreaInput = forwardRef<HTMLTextAreaElement, TextAreaInputProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "squircle-input w-full resize-y leading-relaxed",
        invalid && "!border-[oklch(var(--lacquer)/0.55)] focus:!border-[oklch(var(--lacquer))]",
        className,
      )}
      aria-invalid={invalid ? "true" : undefined}
      {...props}
    />
  ),
);
TextAreaInput.displayName = "TextAreaInput";
