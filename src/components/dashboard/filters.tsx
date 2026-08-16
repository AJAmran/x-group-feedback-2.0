"use client";

import { X, CalendarDays } from "lucide-react";
import { TextInput } from "@/components/ui/TextInput";

/** Compact toolbar sizing shared by all filter inputs (matches h-10 toolbar controls). */
export const FILTER_INPUT_CLASS = "!h-10 !min-h-0 !px-3.5 !py-0 text-caption";

/** Compact select sizing for toolbar dropdowns. */
export const FILTER_SELECT_CLASS = "!h-10 !min-h-0 !px-3.5 !py-0 !pr-9 text-caption !w-auto";

/** Compact date input with a calendar glyph, sized for filter toolbars. */
export function FilterDateInput({
  value,
  onChange,
  ariaLabel,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div className="relative">
      <TextInput
        type="date"
        aria-label={ariaLabel}
        className={`date-filter-input ${FILTER_INPUT_CLASS} !pr-9 !w-[150px] ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <CalendarDays
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ios-foreground-faint pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

/** From / To date range pair with an inline separator. */
export function DateRangeFilter({
  start,
  end,
  onStartChange,
  onEndChange,
  startLabel = "From date",
  endLabel = "To date",
}: {
  start: string;
  end: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  startLabel?: string;
  endLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <FilterDateInput value={start} onChange={onStartChange} ariaLabel={startLabel} />
      <span className="text-micro font-semibold text-ios-foreground-faint">to</span>
      <FilterDateInput value={end} onChange={onEndChange} ariaLabel={endLabel} />
    </div>
  );
}

/** Small removable pill showing an active filter. */
export function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ios-primary/10 border border-ios-primary/15 text-micro font-semibold text-ios-primary">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Clear filter: ${label}`}
        className="hover:text-ios-primary/70 transition-colors"
      >
        <X size={12} />
      </button>
    </span>
  );
}
