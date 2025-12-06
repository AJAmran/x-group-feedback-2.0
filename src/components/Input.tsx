import React from "react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  isTextArea?: boolean;
  error?: boolean;
}

export const Input: React.FC<InputProps> = React.memo(
  ({ label, isTextArea, error, className, ...props }) => {
    const baseClasses = `w-full glass-inner text-slate-800 text-[15px] rounded-xl px-4 py-3.5 placeholder-slate-500/70 transition-all duration-300 transform-gpu
      focus:outline-none focus:bg-white/60 focus:ring-2 focus:ring-[hsl(var(--brand-primary)/0.3)] focus:border-transparent focus:shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:-translate-y-0.5
      hover:bg-white/50 ${error
        ? "!bg-red-50/50 !border-red-300 ring-2 ring-red-100 focus:!ring-red-400 focus:!shadow-red-100"
        : ""
      }`;

    return (
      <div className="flex flex-col space-y-2 w-full group relative isolate">
        <div className="flex justify-between items-baseline ml-1 relative z-10">
          <label
            className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 relative inline-flex items-center gap-2 ${error
              ? "text-red-500"
              : "text-slate-500 group-focus-within:text-[hsl(var(--brand-primary))] group-focus-within:translate-x-1"
              }`}
          >
            {label}
          </label>
          {props.required && (
            <span
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full tracking-widest uppercase backdrop-blur-md shadow-sm ${error
                ? "text-red-700 bg-red-100/80 border border-red-200"
                : "text-[hsl(var(--brand-primary))] bg-white/40 border border-[hsl(var(--brand-primary)/0.1)] group-focus-within:bg-[hsl(var(--brand-primary))] group-focus-within:text-white transition-colors duration-300"
                }`}
            >
              Required
            </span>
          )}
        </div>

        {/* Input Container with potential extra decorations */}
        <div className="relative">
          {isTextArea ? (
            <textarea
              className={`${baseClasses} min-h-[120px] resize-none relative z-10 ${className || ""
                }`}
              aria-invalid={error ? "true" : "false"}
              aria-label={label}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              className={`${baseClasses} relative z-10 ${className || ""}`}
              aria-invalid={error ? "true" : "false"}
              aria-label={label}
              {...props}
            />
          )}

          {/* Subtle inner light reflection */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none opacity-50" />
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
