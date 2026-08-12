"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  danger = true,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-3 mb-6">
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
            danger
              ? "bg-[oklch(var(--lacquer)/0.12)] border-[oklch(var(--lacquer)/0.25)] text-[oklch(var(--lacquer))]"
              : "bg-ios-primary/10 border-ios-primary/20 text-ios-primary"
          }`}
        >
          <AlertTriangle size={18} strokeWidth={2.25} />
        </div>
        <div className="pt-0.5 text-caption text-ios-foreground-subtle leading-relaxed">{message}</div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={onConfirm}
          loading={loading}
          className="flex-1"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
