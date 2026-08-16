import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bone } from "@/app/_components/skeleton";

/**
 * Table primitives — shared building blocks for every dashboard data table
 * so row/header typography stays consistent.
 */

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

export function TH({
  children,
  className,
  align = "left",
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle whitespace-nowrap",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TD({
  children,
  className,
  align = "left",
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-4 py-3.5 align-middle",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function TR({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-ios-border-subtle last:border-0 hover:bg-ios-border-subtle/50 transition-colors",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function THeadRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-ios-border-subtle">{children}</tr>;
}

/**
 * Empty state row spanning all columns. Replaces the repeated
 * hand-rolled "No X found" blocks in every table.
 */
export function TableEmpty({
  colSpan,
  icon: Icon,
  title,
  description,
  action,
}: {
  colSpan: number;
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-14">
        <div className="flex flex-col items-center gap-3 px-6">
          <div className="w-12 h-12 rounded-2xl bg-ios-primary/[0.07] border border-ios-primary/10 flex items-center justify-center">
            <Icon size={24} className="text-ios-primary" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <p className="text-label font-semibold text-ios-foreground">{title}</p>
            {description && <p className="text-caption text-ios-foreground-faint max-w-sm mx-auto">{description}</p>}
          </div>
          {action}
        </div>
      </td>
    </tr>
  );
}

/** Loading row used while tables fetch data. */
export function TableLoading({ colSpan, label = "Loading…" }: { colSpan: number; label?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-16">
        <p className="text-caption text-ios-foreground-subtle font-medium">{label}</p>
      </td>
    </tr>
  );
}

/** Skeleton rows shown while a table fetches data (mirrors real row structure). */
const ROW_DELAYS = [
  "[animation-delay:0ms]",
  "[animation-delay:120ms]",
  "[animation-delay:240ms]",
  "[animation-delay:360ms]",
  "[animation-delay:480ms]",
  "[animation-delay:600ms]",
];

export function TableSkeletonRows({ rows = 5, colSpan }: { rows?: number; colSpan: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} aria-hidden="true" className="border-b border-ios-border-subtle last:border-0">
          <td colSpan={colSpan} className="px-4 py-3.5">
            <div className="flex items-center gap-4">
              <Bone className={`h-5 w-24 shrink-0 ${ROW_DELAYS[i % ROW_DELAYS.length]}`} />
              <Bone className={`h-5 w-32 shrink-0 ${ROW_DELAYS[(i + 1) % ROW_DELAYS.length]}`} />
              <Bone className={`h-5 w-28 shrink-0 ${ROW_DELAYS[(i + 2) % ROW_DELAYS.length]}`} />
              <Bone className={`h-5 flex-1 ${ROW_DELAYS[(i + 3) % ROW_DELAYS.length]}`} />
              <Bone className={`h-5 w-16 shrink-0 ${ROW_DELAYS[(i + 4) % ROW_DELAYS.length]}`} />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}