"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
}

/** Search field with leading magnifier icon, used in dashboard filters. */
export function SearchInput({
  value,
  onChange,
  onEnter,
  placeholder = "Search…",
  className,
  inputClassName,
  id,
}: SearchInputProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-foreground-faint pointer-events-none" />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
        }}
        placeholder={placeholder}
        className={cn("squircle-input w-full pl-9 h-10 text-caption", inputClassName)}
      />
    </div>
  );
}