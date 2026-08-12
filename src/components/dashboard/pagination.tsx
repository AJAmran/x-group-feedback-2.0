"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Show the "Showing X–Y of Z" summary on the left. */
  showSummary?: boolean;
}

function pageWindow(page: number, totalPages: number): number[] {
  const count = Math.min(totalPages, 5);
  const start = Math.max(1, Math.min(page - 2, totalPages - count + 1));
  return Array.from({ length: count }, (_, i) => start + i);
}

/**
 * Reusable pagination control used across dashboard tables.
 * Renders a summary line plus prev / numbered / next buttons.
 */
export function Pagination({ page, totalPages, total, pageSize, onPageChange, showSummary = true }: PaginationProps) {
  if (totalPages <= 1 && !showSummary) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const navBtn =
    "w-8 h-8 rounded-lg hover:bg-ios-border-subtle disabled:opacity-30 disabled:cursor-not-allowed text-ios-foreground-subtle transition-colors flex items-center justify-center";

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-ios-border-subtle bg-ios-border-subtle/20 flex-wrap">
      {showSummary ? (
        <p className="text-caption text-ios-foreground-subtle font-medium">
          Showing{" "}
          <span className="font-bold text-ios-foreground">{from}</span>–
          <span className="font-bold text-ios-foreground">{to}</span> of{" "}
          <span className="font-bold text-ios-foreground">{total}</span>
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={navBtn} aria-label="Previous page">
          <ChevronLeft size={15} />
        </button>
        {pageWindow(page, totalPages).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={cn(
              "w-8 h-8 rounded-lg text-micro font-bold transition-all",
              pageNum === page
                ? "bg-ios-primary text-ios-on-primary shadow-md"
                : "text-ios-foreground-subtle hover:bg-ios-border-subtle",
            )}
            aria-current={pageNum === page ? "page" : undefined}
          >
            {pageNum}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={navBtn}
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}