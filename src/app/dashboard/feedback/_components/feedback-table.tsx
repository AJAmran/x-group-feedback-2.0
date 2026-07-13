"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Eye,
} from "lucide-react";
import { getRatingBadgeStyle, getSentimentColor } from "@/lib/chart-theme";
import { Button } from "@/components/ui/Button";

interface FeedbackItem {
  id: string;
  feedbackId: string;
  guestName: string;
  branchCode: string;
  branchName: string;
  overallRating: string | null;
  createdAt: string;
  status: string;
  sentimentLabel: string | null;
}

interface FeedbackListData {
  items: FeedbackItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-ios-primary/10 text-ios-primary",
  reviewed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  flagged: "bg-red-500/10 text-red-600 dark:text-red-400",
};

interface FeedbackTableProps {
  data: FeedbackListData;
}

export function FeedbackTable({ data }: FeedbackTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/dashboard/feedback?${params.toString()}`);
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-ios-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <MessageSquare size={15} className="text-ios-foreground-subtle" />
          <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">All Entries</span>
          <span className="text-micro font-medium text-ios-foreground-faint bg-ios-border-subtle/50 px-2 py-0.5 rounded-full">{data.total} total</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-micro text-ios-foreground-faint">
            {data.total > 0 ? `Page ${data.page} of ${data.totalPages}` : ""}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ios-border-subtle">
              <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Guest</th>
              <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Branch</th>
              <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Rating</th>
              <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Status</th>
              <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Sentiment</th>
              <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Date</th>
              <th className="text-right px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <MessageSquare size={32} className="text-ios-foreground-faint" />
                    <p className="text-label font-semibold text-ios-foreground-subtle">No feedback found</p>
                    <p className="text-caption text-ios-foreground-faint">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.items.map((item) => (
                <tr key={item.id} className="border-b border-ios-border-subtle last:border-0 hover:bg-ios-border-subtle/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-ios-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-micro font-bold text-ios-primary">
                          {item.guestName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-label font-semibold text-ios-foreground">{item.guestName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-label text-ios-foreground-muted">{item.branchName}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {item.overallRating ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider border" style={getRatingBadgeStyle(item.overallRating)}>
                        {item.overallRating}
                      </span>
                    ) : (
                      <span className="text-caption text-ios-foreground-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider ${STATUS_STYLES[item.status] || "bg-ios-border-subtle text-ios-foreground-subtle"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {item.sentimentLabel ? (
                      <span className="text-micro font-bold uppercase tracking-wider" style={{
                        color: item.sentimentLabel === "positive" || item.sentimentLabel === "negative"
                          ? getSentimentColor(item.sentimentLabel)
                          : "var(--color-ios-foreground-subtle)"
                      }}>
                        {item.sentimentLabel}
                      </span>
                    ) : (
                      <span className="text-caption text-ios-foreground-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-caption text-ios-foreground-subtle font-medium">
                      {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button variant="icon" onClick={() => router.push(`/dashboard/feedback/${item.id}`)} aria-label="View feedback" icon={Eye} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-ios-border-subtle bg-ios-border-subtle/20">
          <p className="text-caption text-ios-foreground-subtle font-medium">
            Showing <span className="font-bold text-ios-foreground">{(data.page - 1) * data.pageSize + 1}</span>–<span className="font-bold text-ios-foreground">{Math.min(data.page * data.pageSize, data.total)}</span> of <span className="font-bold text-ios-foreground">{data.total}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(data.page - 1)}
              disabled={data.page <= 1}
              className="w-8 h-8 rounded-lg hover:bg-ios-border-subtle disabled:opacity-30 disabled:cursor-not-allowed text-ios-foreground-subtle transition-colors flex items-center justify-center"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(data.totalPages, 5) }).map((_, i) => {
              const pageNum = Math.max(1, Math.min(data.page - 2, data.totalPages - 4)) + i;
              if (pageNum > data.totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-micro font-bold transition-all ${
                    pageNum === data.page
                      ? "bg-ios-primary text-ios-on-primary shadow-md"
                      : "text-ios-foreground-subtle hover:bg-ios-border-subtle"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => goToPage(data.page + 1)}
              disabled={data.page >= data.totalPages}
              className="w-8 h-8 rounded-lg hover:bg-ios-border-subtle disabled:opacity-30 disabled:cursor-not-allowed text-ios-foreground-subtle transition-colors flex items-center justify-center"
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
