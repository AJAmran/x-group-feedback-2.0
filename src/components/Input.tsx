import React from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> {
  label: string;
  isTextArea?: boolean;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  validationStatus?: "valid" | "invalid" | "neutral";
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
    ref,
  ) => {
    const uniqueId = React.useId();
    const id = providedId || uniqueId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const [charCount, setCharCount] = React.useState(0);

    const isInvalid = error || validationStatus === "invalid";
    const isValid = validationStatus === "valid";

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setCharCount(e.target.value.length);
      (
        onChange as React.ChangeEventHandler<
          HTMLInputElement | HTMLTextAreaElement
        >
      )?.(e);
    };

    const describedBy =
      [isInvalid && errorMessage ? errorId : "", helperText ? helperId : ""]
        .filter(Boolean)
        .join(" ") || undefined;

    const fieldClassName = cn(
      "squircle-input w-full",
      "placeholder:text-ios-foreground-faint",
      isInvalid &&
        "!border-ios-lacquer/50 focus:!border-ios-lacquer !shadow-none focus:!shadow-[inset_0_-2px_0_var(--tw-shadow-color)] [--tw-shadow-color:oklch(var(--lacquer))]",
      isValid && "!border-emerald-600/35",
      className,
    );

    return (
      <div className="flex flex-col gap-1.5 w-full group">
        {/* Label */}
        <div className="flex items-center justify-between px-0.5">
          <label
            htmlFor={id}
            className="text-micro font-bold tracking-[0.1em] uppercase text-ios-foreground-subtle transition-colors duration-200 group-focus-within:text-ios-primary"
          >
            {label}
            {props.required && (
              <span className="text-ios-lacquer ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>

          <AnimatePresence mode="wait">
            {validationStatus !== "neutral" && (
              <motion.div
                key={validationStatus}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.15 }}
                role="status"
                aria-live="polite"
                className={cn(
                  "flex items-center gap-1 text-micro font-bold uppercase tracking-wider",
                  isValid
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-ios-lacquer",
                )}
              >
                {isValid ? (
                  <Check size={10} strokeWidth={3} aria-hidden />
                ) : (
                  <X size={10} strokeWidth={3} aria-hidden />
                )}
                {isValid ? "Verified" : "Check format"}
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
              className={cn(
                fieldClassName,
                "min-h-[110px] resize-none leading-relaxed py-3.5",
              )}
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
              className={cn(
                fieldClassName,
                "h-[50px] sm:h-[54px] px-3.5 pr-11",
              )}
              onChange={handleChange}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          <AnimatePresence>
            {!isTextArea && isValid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 500, damping: 26 }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div className="w-[18px] h-[18px] rounded-full bg-emerald-600 flex items-center justify-center">
                  <Check
                    size={10}
                    strokeWidth={3}
                    className="text-white"
                    aria-hidden
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer row */}
        <div
          className="flex items-start justify-between gap-3 px-0.5"
          style={{ minHeight: "1rem" }}
        >
          <AnimatePresence mode="wait">
            {isInvalid && errorMessage ? (
              <motion.p
                key="error"
                id={errorId}
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14 }}
                className="flex items-center gap-1.5 text-caption font-medium text-ios-lacquer leading-tight"
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

          {isTextArea && maxCharCount && (
            <span
              className={cn(
                "text-micro font-mono font-semibold tabular-nums ml-auto shrink-0 transition-colors duration-300",
                charCount >= maxCharCount
                  ? "text-ios-lacquer"
                  : charCount >= maxCharCount * 0.85
                    ? "text-ios-accent"
                    : "text-ios-foreground-faint",
              )}
            >
              {charCount}/{maxCharCount}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";
