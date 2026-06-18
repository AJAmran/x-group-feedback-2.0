"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  MessageSquare,
  ExternalLink,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import { getFeedbackDetail, updateFeedbackStatus } from "@/features/dashboard/actions";

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

const RATING_COLORS: Record<string, string> = {
  EXCELLENT: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  GOOD: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",
  AVERAGE: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  POOR: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  VERY_POOR: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
};

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

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const openDetails = async (id: string) => {
    setSelectedId(id);
    setLoading(true);
    try {
      const res = await getFeedbackDetail(id);
      setDetails(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedId(null);
    setDetails(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedId) return;
    setStatusUpdating(true);
    try {
      await updateFeedbackStatus(selectedId, newStatus);
      const res = await getFeedbackDetail(selectedId);
      setDetails(res);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setStatusUpdating(false);
    }
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/dashboard/feedback?${params.toString()}`);
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ios-border-subtle">
              <th className="text-left px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Guest</th>
              <th className="text-left px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Branch</th>
              <th className="text-left px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Rating</th>
              <th className="text-left px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Status</th>
              <th className="text-left px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Sentiment</th>
              <th className="text-left px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Date</th>
              <th className="text-right px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Actions</th>
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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider border ${RATING_COLORS[item.overallRating] || "bg-ios-border-subtle text-ios-foreground-subtle"}`}>
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
                      <span className={`text-micro font-bold uppercase tracking-wider ${
                        item.sentimentLabel === "positive" ? "text-emerald-500" :
                        item.sentimentLabel === "negative" ? "text-red-500" : "text-ios-foreground-subtle"
                      }`}>
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
                    <button 
                      onClick={() => openDetails(item.id)}
                      className="p-2 rounded-lg hover:bg-ios-border-subtle text-ios-foreground-subtle hover:text-ios-primary transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3.5 border-t border-ios-border-subtle">
          <p className="text-caption text-ios-foreground-subtle font-medium">
            Showing {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} of {data.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(data.page - 1)}
              disabled={data.page <= 1}
              className="p-2 rounded-lg hover:bg-ios-border-subtle disabled:opacity-30 disabled:cursor-not-allowed text-ios-foreground-subtle transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(data.totalPages, 5) }).map((_, i) => {
              const pageNum = Math.max(1, Math.min(data.page - 2, data.totalPages - 4)) + i;
              if (pageNum > data.totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-micro font-bold transition-colors ${
                    pageNum === data.page
                      ? "bg-ios-primary text-ios-on-primary"
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
              className="p-2 rounded-lg hover:bg-ios-border-subtle disabled:opacity-30 disabled:cursor-not-allowed text-ios-foreground-subtle transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-ios-background glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-ios-background/80 backdrop-blur-md border-b border-ios-border-subtle p-6 flex items-center justify-between z-10">
              <h2 className="text-subtitle font-bold text-ios-foreground">Feedback Details</h2>
              <button onClick={closeDetails} className="p-2 bg-ios-border-subtle rounded-full hover:bg-ios-border transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-ios-foreground-subtle">
                  <Loader2 className="animate-spin mb-4" size={32} />
                  <p>Loading details...</p>
                </div>
              ) : details ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-micro font-bold uppercase text-ios-foreground-faint tracking-wider mb-1">Guest Info</p>
                      <p className="text-label font-bold text-ios-foreground">{details.guestName}</p>
                      <p className="text-caption text-ios-foreground-subtle">{details.guestContact}</p>
                      {details.ageGroup && <p className="text-caption text-ios-foreground-subtle">Age: {details.ageGroup}</p>}
                      {details.source && <p className="text-caption text-ios-foreground-subtle">Source: {details.source}</p>}
                    </div>
                    <div>
                      <p className="text-micro font-bold uppercase text-ios-foreground-faint tracking-wider mb-1">Visit Info</p>
                      <p className="text-label font-bold text-ios-foreground">{details.branchName}</p>
                      <p className="text-caption text-ios-foreground-subtle">Ref: {details.branchCode}-{details.feedbackId}</p>
                      <p className="text-caption text-ios-foreground-subtle">Date: {new Date(details.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-ios-border-subtle/30 rounded-2xl p-4">
                    <p className="text-micro font-bold uppercase text-ios-foreground-faint tracking-wider mb-3">Ratings</p>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <div className="flex justify-between items-center text-caption"><span className="text-ios-foreground-subtle">Overall</span><span className="font-bold">{details.overallRating || "—"}</span></div>
                      <div className="flex justify-between items-center text-caption"><span className="text-ios-foreground-subtle">Food</span><span className="font-bold">{details.foodRating || "—"}</span></div>
                      <div className="flex justify-between items-center text-caption"><span className="text-ios-foreground-subtle">Service</span><span className="font-bold">{details.serviceRating || "—"}</span></div>
                      <div className="flex justify-between items-center text-caption"><span className="text-ios-foreground-subtle">Environment</span><span className="font-bold">{details.environmentRating || "—"}</span></div>
                    </div>
                  </div>

                  {details.comments && (
                    <div>
                      <p className="text-micro font-bold uppercase text-ios-foreground-faint tracking-wider mb-2">Guest Comments</p>
                      <div className="bg-ios-primary/5 border border-ios-primary/10 rounded-2xl p-4">
                        <p className="text-body text-ios-foreground whitespace-pre-wrap">{details.comments}</p>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-ios-border-subtle pt-6">
                    <p className="text-micro font-bold uppercase text-ios-foreground-faint tracking-wider mb-3">Status Management</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {["pending", "reviewed", "flagged"].map((s) => (
                        <button
                          key={s}
                          disabled={statusUpdating}
                          onClick={() => handleStatusChange(s)}
                          className={`px-4 py-2 rounded-xl text-caption font-bold capitalize border transition-all ${
                            (details.review?.status || "pending") === s
                              ? "bg-ios-primary text-white border-ios-primary shadow-md"
                              : "bg-transparent border-ios-border-subtle text-ios-foreground-subtle hover:border-ios-primary/50"
                          } disabled:opacity-50`}
                        >
                          {statusUpdating && (details.review?.status || "pending") === s ? <Loader2 className="animate-spin inline mr-2" size={14} /> : null}
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-red-500">Failed to load details.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
