"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  /** Fully custom header node. When provided, replaces the default title/description block. */
  header?: React.ReactNode;
  children: React.ReactNode;
  /** Optional trailing node rendered next to the close button (e.g. a status badge). */
  headerExtra?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  header,
  children,
  headerExtra,
  size = "md",
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className={cn(
          "relative w-full max-h-[90vh] overflow-y-auto glass-card p-6 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200",
          SIZE_CLASS[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0 flex-1">
            {header ?? (
              <>
                {title && <h2 className="text-label font-bold text-ios-foreground">{title}</h2>}
                {description && (
                  <p className="text-caption text-ios-foreground-muted mt-0.5">{description}</p>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerExtra}
            <Button variant="icon" size="sm" onClick={onClose} aria-label="Close" icon={X} />
          </div>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
