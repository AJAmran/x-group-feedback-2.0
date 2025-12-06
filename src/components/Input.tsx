import React from "react";
import { Check, X } from "lucide-react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  isTextArea?: boolean;
  error?: boolean; // Keep for backward compatibility or general errors
  validationStatus?: "valid" | "invalid" | "neutral";
  validationMessage?: string;
}

export const Input: React.FC<InputProps> = React.memo(
  ({ label, isTextArea, error, validationStatus = "neutral", validationMessage, className, ...props }) => {
    // Determine effective error state
    const isInvalid = error || validationStatus === "invalid";
    const isValid = validationStatus === "valid";

    const baseClasses = `w-full glass-inner text-slate-800 text-[15px] rounded-xl px-4 py-3.5 placeholder-slate-500/70 transition-all duration-300 transform-gpu
      focus:outline-none focus:bg-white/60 focus:ring-2 focus:ring-[hsl(var(--brand-primary)/0.3)] focus:border-transparent focus:shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:-translate-y-0.5
      hover:bg-white/50 
      ${isInvalid
        ? "!bg-red-50/50 !border-red-300 ring-2 ring-red-100 focus:!ring-red-400 focus:!shadow-red-100"
        : ""
      }
      ${isValid
        ? "!bg-green-50/50 !border-green-300 ring-2 ring-green-100 focus:!ring-green-400 focus:!shadow-green-100"
        : ""
      }`;

    return (
      <div className="flex flex-col space-y-2 w-full group relative isolate">
        <div className="flex justify-between items-baseline ml-1 relative z-10">
          <label
            className={`text-sm font-bold uppercase tracking-widest transition-all duration-300 relative inline-flex items-center gap-2 
              ${isInvalid ? "text-red-500" : ""}
              ${isValid ? "text-green-600" : ""}
              ${!isInvalid && !isValid ? "text-slate-600 group-focus-within:text-[hsl(var(--brand-primary))] group-focus-within:translate-x-1" : ""}
              `}
          >
            {label}
          </label>
          <div className="flex items-center gap-2">
            {/* Real-time Validation Feedback */}
            {validationStatus !== "neutral" && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase flex items-center gap-1
                  ${isValid ? "text-green-700 bg-green-100/80 border border-green-200" : ""}
                  ${isInvalid ? "text-red-700 bg-red-100/80 border border-red-200" : ""}
                `}
              >
                {isValid ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                {isValid ? "Valid" : "Invalid"}
              </span>
            )}

            {props.required && validationStatus === "neutral" && (
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
        </div>

        {/* Input Container with potential extra decorations */}
        <div className="relative">
          {isTextArea ? (
            <textarea
              className={`${baseClasses} min-h-[120px] resize-none relative z-10 ${className || ""
                }`}
              aria-invalid={isInvalid ? "true" : "false"}
              aria-label={label}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              className={`${baseClasses} relative z-10 ${className || ""}`}
              aria-invalid={isInvalid ? "true" : "false"}
              aria-label={label}
              {...props}
            />
          )}

          {/* Subtle inner light reflection */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent pointer-events-none opacity-50" />
        </div>

        {/* Additional Validation Message if provided */}
        {validationMessage && isInvalid && (
          <span className="text-xs text-red-500 font-medium ml-1 animate-fadeIn">{validationMessage}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
