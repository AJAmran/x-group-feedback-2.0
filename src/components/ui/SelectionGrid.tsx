import React from "react";
import { motion } from "framer-motion";

interface Option {
    label: string;
    value: string;
}

interface SelectionGridProps {
    options: Option[];
    selectedValue: string | null;
    onChange: (value: string) => void;
    gridColsClass?: string;
    labelSize?: "xs" | "sm";
    id?: string;
    "aria-labelledby"?: string;
}

export const SelectionGrid: React.FC<SelectionGridProps> = ({ 
    options, 
    selectedValue, 
    onChange, 
    gridColsClass = "grid-cols-2 sm:grid-cols-4",
    labelSize = "xs",
    "aria-labelledby": ariaLabelledBy
}) => {
    return (
        <ul 
            className={`grid ${gridColsClass} gap-3`}
            role="radiogroup"
            aria-labelledby={ariaLabelledBy}
        >
            {options.map((opt) => {
                const isSelected = selectedValue === opt.value;
                return (
                    <li key={opt.value} className="list-none">
                        <motion.button
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => onChange(opt.value)}
                            className={`
                                w-full px-4 py-3 min-h-[68px] sm:min-h-[72px] rounded-[1.35rem] font-semibold transition-colors duration-200 border backdrop-blur-sm
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                                ${labelSize === "xs" ? "text-label" : "text-body"} tracking-wide
                                ${isSelected
                                    ? "bg-ios-primary text-ios-on-primary border-transparent shadow-[0_12px_24px_-10px_oklch(var(--ios-primary)/0.45)]"
                                    : "liquid-glass hover:bg-ios-border-subtle text-ios-foreground-muted hover:text-ios-foreground hover:border-ios-primary/25"
                                }
                            `}

                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        >
                            {opt.label}
                        </motion.button>
                    </li>
                );
            })}
        </ul>
    );
};
