import React from "react";
import { RatingCategory, RatingValue } from "../types";
import { RATING_OPTIONS, CATEGORY_LABELS } from "../lib/constants";
import { motion, AnimatePresence } from "framer-motion";

interface RatingRowProps {
  category: RatingCategory;
  value: RatingValue | null;
  onChange: (category: RatingCategory, value: RatingValue) => void;
}

const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

const VALUE_TEXT: Record<RatingValue, string> = {
  [RatingValue.EXCELLENT]: "text-ios-primary",
  [RatingValue.GOOD]: "text-emerald-700 dark:text-emerald-400",
  [RatingValue.AVERAGE]: "text-ios-accent",
  [RatingValue.POOR]: "text-red-600 dark:text-red-400",
};

export const RatingRow: React.FC<RatingRowProps> = React.memo(
  ({ category, value, onChange }) => {
    const groupId = React.useId();

    return (
      <div
        className="px-3 sm:px-4 py-3 sm:py-3.5 border-b border-ios-border-subtle last:border-b-0"
        role="radiogroup"
        aria-labelledby={groupId}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span
            id={groupId}
            className="text-label font-semibold text-ios-foreground"
          >
            {CATEGORY_LABELS[category]}
          </span>
          <AnimatePresence mode="wait">
            {value && (
              <motion.span
                key={value}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "text-micro font-mono font-bold uppercase tracking-[0.1em]",
                  VALUE_TEXT[value],
                )}
              >
                {value}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Segmented scorecard — one continuous bordered strip, not three separate cards */}
        <div className="relative grid grid-cols-4 rounded-[var(--radius-ios-sm)] border border-ios-border-subtle bg-surface-100 overflow-hidden">
          {RATING_OPTIONS.map((opt, i) => {
            const Icon = opt.icon;
            const isSelected = value === opt.val;

            return (
              <button
                key={opt.val}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Rate ${category} as ${opt.label}`}
                onClick={() => onChange(category, opt.val)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2.5 sm:py-3",
                  "transition-colors duration-200",
                  i !== 0 && "border-l border-ios-border-subtle",
                  "focus-visible:outline-none focus-visible:bg-ios-primary/5",
                  isSelected
                    ? "text-ios-foreground"
                    : "text-ios-foreground-faint hover:text-ios-foreground-muted",
                )}
              >
                <Icon
                  size={15}
                  strokeWidth={isSelected ? 2.4 : 1.8}
                  aria-hidden
                  className={isSelected ? VALUE_TEXT[opt.val] : undefined}
                />
                <span className="text-caption font-semibold tracking-wide">
                  {opt.label}
                </span>

                {isSelected && (
                  <motion.div
                    layoutId={`underline-${category}`}
                    className="absolute left-0 right-0 bottom-0 h-[2.5px]"
                    style={{
                      background:
                        opt.val === RatingValue.EXCELLENT
                          ? "oklch(var(--ios-primary))"
                          : opt.val === RatingValue.GOOD
                            ? "oklch(55% 0.12 155)"
                            : opt.val === RatingValue.AVERAGE
                              ? "oklch(var(--ios-accent))"
                              : "oklch(55% 0.18 30)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

RatingRow.displayName = "RatingRow";
