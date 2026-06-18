import React from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  isTextArea?: boolean;
  error?: boolean;
  /** Actual message shown below the field — pass errors.fieldName?.message */
  errorMessage?: string;
  /** Subtle hint shown below the field when there is no error */
  helperText?: string;
  validationStatus?: "valid" | "invalid" | "neutral";
  /** Enables character counter on textarea and enforces maxLength */
  maxCharCount?: number;
}

const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

export const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(
  (
    {
      label,
      isTextArea,
      error,
      errorMessage,
      helperText,
      validationStatus = "neutral",
      className,
      id: providedId,
      maxCharCount,
      onChange,
      ...props
    },
    ref
  ) => {
    const uniqueId = React.useId();
    const id = providedId || uniqueId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const [charCount, setCharCount] = React.useState(0);

    const isInvalid = error || validationStatus === "invalid";
    const isValid = validationStatus === "valid";

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setCharCount(e.target.value.length);
      (onChange as React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>)?.(e);
    };

    const describedBy = [
      isInvalid && errorMessage ? errorId : "",
      helperText ? helperId : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    const fieldClassName = cn(
      "squircle-input w-full transition-all duration-200",
      "placeholder:text-ios-foreground-faint",
      "focus:ring-2 focus:ring-ios-primary/20 focus:border-ios-primary/50",
      isInvalid &&
        "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/15 bg-red-500/[0.03]",
      isValid &&
        "border-green-500/35 focus:border-green-500/50 focus:ring-green-500/10",
      className
    );

    return (
      <div className="flex flex-col gap-2 w-full group">
        {/* Label + animated status badge */}
        <div className="flex items-center justify-between px-0.5">
          <label
            htmlFor={id}
            className="text-label font-semibold tracking-wide text-ios-foreground-muted capitalize transition-colors duration-200 group-focus-within:text-ios-foreground"
          >
            {label}
            {props.required && (
              <span className="text-ios-primary ml-1 font-black" aria-hidden="true">
                *
              </span>
            )}
          </label>

          <AnimatePresence mode="wait">
            {validationStatus !== "neutral" && (
              <motion.div
                key={validationStatus}
                initial={{ opacity: 0, scale: 0.7, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.7, x: 10 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                role="status"
                aria-live="polite"
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full",
                  "text-micro font-black uppercase tracking-widest ring-1",
                  isValid
                    ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400 dark:bg-emerald-500/15"
                    : "bg-red-500/10 text-red-600 ring-red-500/25 dark:text-red-400 dark:bg-red-500/15"
                )}
              >
                {isValid ? (
                  <Check size={8} strokeWidth={3.5} aria-hidden />
                ) : (
                  <X size={8} strokeWidth={3.5} aria-hidden />
                )}
                {isValid ? "Valid" : "Invalid"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Field */}
        <div className="relative">
          {isTextArea ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={id}
              aria-invalid={isInvalid ? "true" : "false"}
              aria-required={props.required ? "true" : "false"}
              aria-describedby={describedBy}
              maxLength={maxCharCount}
              className={cn(fieldClassName, "min-h-[120px] resize-none leading-relaxed py-4")}
              onChange={handleChange}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={id}
              aria-invalid={isInvalid ? "true" : "false"}
              aria-required={props.required ? "true" : "false"}
              aria-describedby={describedBy}
              maxLength={maxCharCount}
              className={cn(fieldClassName, "h-[54px] sm:h-[60px] px-4 pr-12")}
              onChange={handleChange}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {/* Valid checkmark bubble inside single-line input */}
          <AnimatePresence>
            {!isTextArea && isValid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/30">
                  <Check size={10} strokeWidth={3} className="text-white" aria-hidden />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer row: error/helper + char count */}
        <div className="flex items-start justify-between gap-3 px-0.5" style={{ minHeight: "1rem" }}>
          <AnimatePresence mode="wait">
            {isInvalid && errorMessage ? (
              <motion.p
                key="error"
                id={errorId}
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="flex items-center gap-1.5 text-caption font-semibold text-red-500 dark:text-red-400 leading-tight"
              >
                <AlertCircle size={11} aria-hidden />
                {errorMessage}
              </motion.p>
            ) : helperText && !isInvalid ? (
              <motion.p
                key="helper"
                id={helperId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-caption text-ios-foreground-subtle font-medium leading-tight"
              >
                {helperText}
              </motion.p>
            ) : (
              <span key="spacer" />
            )}
          </AnimatePresence>

          {/* Char counter — only for textarea with maxCharCount */}
          {isTextArea && maxCharCount && (
            <span
              className={cn(
                "text-micro font-bold tabular-nums ml-auto shrink-0 transition-colors duration-300",
                charCount >= maxCharCount
                  ? "text-red-500"
                  : charCount >= maxCharCount * 0.85
                  ? "text-amber-500"
                  : "text-ios-foreground-faint"
              )}
            >
              {charCount}/{maxCharCount}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
