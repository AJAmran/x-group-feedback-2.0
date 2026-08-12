import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  children: React.ReactNode;
  tone?: "error" | "success";
  className?: string;
}

/** Consistent inline alert used across admin forms and save actions. */
export function ErrorMessage({ children, tone = "error", className }: ErrorMessageProps) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 px-3 py-2 rounded-xl border text-caption font-semibold",
        tone === "error"
          ? "bg-[oklch(var(--lacquer)/0.08)] border-[oklch(var(--lacquer)/0.22)] text-[oklch(var(--lacquer))]"
          : "bg-[oklch(42%_0.12_155/0.08)] border-[oklch(42%_0.12_155/0.25)] text-[oklch(42%_0.12_155)]",
        className,
      )}
    >
      <Icon size={14} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}