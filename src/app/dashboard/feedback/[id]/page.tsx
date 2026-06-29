import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, User, Building2, Calendar, Hash, Tag, MessageCircle } from "lucide-react";
import { getFeedbackDetail } from "@/features/dashboard/actions";

interface Props {
  params: Promise<{ id: string }>;
}

const RATING_BADGE: Record<string, string> = {
  EXCELLENT: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  GOOD: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",
  AVERAGE: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  POOR: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  VERY_POOR: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
};

const RATING_BAR_BG: Record<string, string> = {
  5: "bg-emerald-500",
  4: "bg-sky-500",
  3: "bg-amber-500",
  2: "bg-orange-500",
  1: "bg-red-500",
};

function ratingValue(label: string | null): number {
  if (label === "EXCELLENT") return 5;
  if (label === "GOOD") return 4;
  if (label === "AVERAGE") return 3;
  if (label === "POOR") return 2;
  if (label === "VERY_POOR") return 1;
  return 0;
}

function RatingBar({ label, value }: { label: string; value: string | null }) {
  const num = ratingValue(value);
  const barColor = RATING_BAR_BG[num] || "bg-ios-border-subtle";

  return (
    <div className="flex items-center gap-4">
      <span className="w-20 text-caption font-medium text-ios-foreground-muted shrink-0">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-ios-border-subtle overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${(num / 5) * 100}%` }} />
      </div>
      <span className={`w-20 text-right text-caption font-bold ${value ? "text-ios-foreground" : "text-ios-foreground-faint"}`}>
        {value || "—"}
      </span>
    </div>
  );
}

export default async function FeedbackDetailPage({ params }: Props) {
  const { id } = await params;
  const details = await getFeedbackDetail(id);

  if (!details) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <Link
        href="/dashboard/feedback"
        className="inline-flex items-center gap-1.5 text-caption font-semibold text-ios-foreground-subtle hover:text-ios-primary transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Feedback
      </Link>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="border-b border-ios-border-subtle px-6 py-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ios-primary/20 to-ios-accent/20 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-body font-extrabold text-ios-primary">
              {details.guestName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-title font-extrabold text-ios-foreground tracking-tight truncate">{details.guestName}</h1>
                <p className="text-label text-ios-foreground-muted mt-0.5">{details.guestContact}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider border shrink-0 ${RATING_BADGE[details.overallRating] || "bg-ios-border-subtle text-ios-foreground-subtle border-ios-border"}`}>
                <Star size={11} className="fill-current" />
                {details.overallRating}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
              <span className="inline-flex items-center gap-1.5 text-caption text-ios-foreground-faint">
                <Building2 size={13} className="text-ios-foreground-subtle" />
                {details.branchName}
              </span>
              <span className="inline-flex items-center gap-1.5 text-caption text-ios-foreground-faint">
                <Calendar size={13} className="text-ios-foreground-subtle" />
                {new Date(details.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span className="inline-flex items-center gap-1.5 text-caption text-ios-foreground-faint">
                <Hash size={13} className="text-ios-foreground-subtle" />
                {details.branchCode}-{details.feedbackId}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-7">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star size={14} className="text-ios-foreground-subtle" />
              <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Ratings Breakdown</span>
            </div>
            <div className="space-y-3">
              <RatingBar label="Overall" value={details.overallRating} />
              <RatingBar label="Food" value={details.foodRating} />
              <RatingBar label="Service" value={details.serviceRating} />
              <RatingBar label="Environment" value={details.environmentRating} />
            </div>
          </div>

          {(details.ageGroup || details.source) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {details.ageGroup && (
                <div className="bg-ios-border-subtle/30 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ios-primary/10 flex items-center justify-center shrink-0">
                    <User size={15} className="text-ios-primary" />
                  </div>
                  <div>
                    <p className="text-micro font-medium text-ios-foreground-faint uppercase tracking-wider">Age Group</p>
                    <p className="text-label font-bold text-ios-foreground mt-0.5">{details.ageGroup}</p>
                  </div>
                </div>
              )}
              {details.source && (
                <div className="bg-ios-border-subtle/30 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ios-accent/10 flex items-center justify-center shrink-0">
                    <Tag size={15} className="text-ios-accent" />
                  </div>
                  <div>
                    <p className="text-micro font-medium text-ios-foreground-faint uppercase tracking-wider">Source</p>
                    <p className="text-label font-bold text-ios-foreground mt-0.5">{details.source}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {details.comments && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle size={14} className="text-ios-foreground-subtle" />
                <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Guest Comments</span>
              </div>
              <div className="relative bg-ios-primary/5 border border-ios-primary/10 rounded-2xl p-5">
                <div className="absolute top-3.5 left-3.5 text-ios-primary/15">
                  <MessageCircle size={22} className="rotate-180" />
                </div>
                <p className="text-body text-ios-foreground whitespace-pre-wrap leading-relaxed pl-8">{details.comments}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
