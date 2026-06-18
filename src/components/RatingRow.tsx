import React from "react";
import { RatingCategory, RatingValue } from "../types";
import { RATING_OPTIONS } from "../lib/constants";
import { motion, AnimatePresence } from "framer-motion";

interface RatingRowProps {
  category: RatingCategory;
  value: RatingValue | null;
  onChange: (category: RatingCategory, value: RatingValue) => void;
}

const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

/**
 * Colour semantics per rating tier — consistent across badge and button.
 * Adjust hues here and they propagate everywhere.
 */
const VALUE_STYLES: Record<
  RatingValue,
  { activeBg: string; badge: string }
> = {
  [RatingValue.EXCELLENT]: {
    activeBg:
      "bg-ios-primary text-ios-on-primary shadow-lg shadow-ios-primary/25 ring-1 ring-white/25 border-transparent",
    badge:
      "bg-ios-primary/10 text-ios-primary ring-ios-primary/25 dark:bg-ios-primary/20 dark:text-ios-primary",
  },
  [RatingValue.GOOD]: {
    activeBg:
      "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/25 border-transparent dark:bg-emerald-500 dark:text-slate-950",
    badge:
      "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400 dark:bg-emerald-500/15",
  },
  [RatingValue.AVERAGE]: {
    activeBg:
      "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 ring-1 ring-white/30 border-transparent",
    badge:
      "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-400 dark:bg-amber-500/15",
  },
};

export const RatingRow: React.FC<RatingRowProps> = React.memo(
  ({ category, value, onChange }) => {
    const groupId = React.useId();

    return (
      <div
        className="px-3 py-3.5 rounded-2xl transition-colors duration-300 group/row hover:bg-ios-border-subtle"
        role="radiogroup"
        aria-labelledby={groupId}
      >
        {/* Row header */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <span
            id={groupId}
            className="text-label font-semibold capitalize tracking-wide text-ios-foreground-muted group-hover/row:text-ios-foreground transition-colors duration-200"
          >
            {category}
          </span>

          {/* Animated selection badge */}
          <AnimatePresence mode="wait">
            {value && (
              <motion.span
                key={value}
                initial={{ opacity: 0, scale: 0.7, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.7, x: 10 }}
                transition={{ type: "spring", stiffness: 500, damping: 26 }}
                className={cn(
                  "text-micro font-black uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full ring-1",
                  VALUE_STYLES[value]?.badge
                )}
              >
                {value}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Rating buttons */}
        <div className="grid grid-cols-3 gap-2">
          {RATING_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = value === opt.val;
            const styles = VALUE_STYLES[opt.val];

            return (
              <motion.button
                key={opt.val}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Rate ${category} as ${opt.label}`}
                onClick={() => onChange(category, opt.val)}
                whileHover={!isSelected ? { y: -2, scale: 1.02 } : undefined}
                whileTap={{ scale: 0.94 }}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1.5",
                  "min-h-[68px] sm:min-h-[74px] rounded-[1.15rem] border",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-ios-primary/40",
                  isSelected
                    ? styles?.activeBg
                    : "liquid-glass text-ios-foreground-muted hover:text-ios-foreground hover:border-ios-primary/25"
                )}
              >
                {/* Icon settles into a restrained selected state. */}
                <motion.div
                  animate={{ scale: isSelected ? 1.08 : 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                >
                  <Icon
                    size={18}
                    strokeWidth={isSelected ? 2.5 : 2}
                    aria-hidden
                    className={cn(
                      "transition-colors duration-200",
                      !isSelected && "text-ios-foreground-subtle"
                    )}
                  />
                </motion.div>

                <span
                  className={cn(
                    "text-caption font-bold capitalize tracking-wide",
                    !isSelected && "text-ios-foreground-subtle"
                  )}
                >
                  {opt.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }
);

RatingRow.displayName = "RatingRow";
