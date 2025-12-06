import React, { useMemo } from "react";
import { RatingCategory, RatingValue } from "../types";
import { Smile, Meh, Star } from "lucide-react";

interface RatingRowProps {
  category: RatingCategory;
  value: RatingValue | null;
  onChange: (category: RatingCategory, value: RatingValue) => void;
}

export const RatingRow: React.FC<RatingRowProps> = React.memo(
  ({ category, value, onChange }) => {
    const options = useMemo(
      () => [
        {
          val: RatingValue.EXCELLENT,
          label: "Excellent",
          icon: Star,
          activeClasses:
            "bg-gradient-to-br from-[hsl(var(--brand-dark))] to-[hsl(var(--brand-primary))] border-transparent text-white shadow-lg shadow-[hsl(var(--brand-primary))/0.4]",
          iconClass: "text-amber-300 fill-amber-300",
        },
        {
          val: RatingValue.GOOD,
          label: "Good",
          icon: Smile,
          activeClasses:
            "bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-primary-light))] border-transparent text-white shadow-lg shadow-[hsl(var(--brand-primary))/0.3]",
          iconClass: "text-white",
        },
        {
          val: RatingValue.AVERAGE,
          label: "Average",
          icon: Meh,
          activeClasses: "bg-slate-600 border-transparent text-white shadow-lg shadow-slate-500/30",
          iconClass: "text-slate-200",
        },
      ],
      []
    );

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-3 px-2 hover:bg-white/5 transition-colors duration-200 rounded-xl group/row">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 sm:mb-0 sm:mr-4 min-w-[100px] px-2 transition-colors group-hover/row:text-[hsl(var(--brand-primary))]">
          {category}
        </span>
        <div className="grid grid-cols-3 gap-3 w-full sm:max-w-[300px]">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = value === opt.val;

            return (
              <button
                key={opt.val}
                type="button"
                onClick={() => onChange(category, opt.val)}
                aria-label={`Rate ${category} as ${opt.label}`}
                aria-pressed={isSelected}
                className={`
                relative flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 transform-gpu
                border backdrop-blur-md
                ${isSelected
                    ? `${opt.activeClasses} scale-[1.05] ring-2 ring-white/50 ring-offset-2 ring-offset-transparent`
                    : "bg-white/30 border-white/40 text-slate-500 hover:bg-white/60 hover:border-white/60 hover:-translate-y-0.5 hover:shadow-md hover:text-[hsl(var(--brand-primary))]"
                  }
              `}
              >
                {/* Active state inner shine */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                )}

                <div className="relative z-10 flex flex-col items-center gap-1.5">
                  <Icon
                    size={20}
                    className={`transition-all duration-300 ${isSelected
                      ? "scale-110 " + opt.iconClass
                      : "group-hover:scale-110"
                      }`}
                    strokeWidth={2}
                  />
                  <span className="text-[10px] font-bold tracking-wide">
                    {opt.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

RatingRow.displayName = "RatingRow";
