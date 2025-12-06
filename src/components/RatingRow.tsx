import React, { useMemo } from "react";
import { RatingCategory, RatingValue } from "../types";
import { Smile, Meh, Star } from "lucide-react";

interface RatingRowProps {
  category: RatingCategory;
  value: RatingValue | null;
  onChange: (category: RatingCategory, value: RatingValue) => void;
}

export const RatingRow: React.FC<RatingRowProps> = React.memo(({
  category,
  value,
  onChange,
}) => {
  const options = useMemo(() => [
    {
      val: RatingValue.EXCELLENT,
      label: "Excellent",
      icon: Star,
      activeColor: "bg-[hsl(var(--brand-dark))] border-[hsl(var(--brand-dark))] text-white shadow-md shadow-[hsl(var(--brand-primary))]/30",
    },
    {
      val: RatingValue.GOOD,
      label: "Good",
      icon: Smile,
      activeColor: "bg-[hsl(var(--brand-primary-light))] border-[hsl(var(--brand-primary-light))] text-white shadow-md shadow-[hsl(var(--brand-primary))]/20",
    },
    {
      val: RatingValue.AVERAGE,
      label: "Average",
      icon: Meh,
      activeColor: "bg-slate-500 border-slate-500 text-white shadow-md shadow-slate-500/20",
    },
  ], []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-3 px-2">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 sm:mb-0 sm:mr-4 min-w-[100px]">
        {category}
      </span>
      <div className="grid grid-cols-3 gap-2 w-full sm:max-w-[280px]">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.val;

          return (
            <button
              key={opt.val}
              type="button"
              onClick={() => onChange(category, opt.val)}
              className={`
                relative group flex flex-col items-center justify-center py-2.5 px-1 rounded-lg transition-all duration-200 border hover:scale-105
                ${isSelected
                  ? `${opt.activeColor} scale-[1.02]`
                  : "bg-white/60 backdrop-blur-md border-white/40 text-slate-400 hover:border-[hsl(var(--brand-primary))]/20 hover:text-[hsl(var(--brand-primary-light))] shadow-sm"
                }
              `}
            >
              <Icon
                size={18}
                className={`mb-1 transition-transform duration-300 ${isSelected ? "scale-110" : "group-hover:scale-110"
                  }`}
                fill={
                  isSelected && opt.val === RatingValue.EXCELLENT
                    ? "currentColor"
                    : "none"
                }
                strokeWidth={2}
              />
              <span className="text-[10px] font-medium tracking-wide">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

RatingRow.displayName = 'RatingRow';
