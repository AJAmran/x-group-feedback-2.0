"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
}

/**
 * Styled select for admin forms. Renders the provided options plus an
 * optional placeholder (empty) entry.
 */
export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ className, options, placeholder, invalid, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "squircle-input w-full appearance-none bg-no-repeat pr-10",
        "bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
        "bg-[right_0.9rem_center]",
        invalid && "!border-[oklch(var(--lacquer)/0.55)] focus:!border-[oklch(var(--lacquer))]",
        className,
      )}
      aria-invalid={invalid ? "true" : undefined}
      {...props}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
);
SelectInput.displayName = "SelectInput";
