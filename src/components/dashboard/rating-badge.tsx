import { getRatingBadgeStyle } from "@/lib/chart-theme";

interface RatingBadgeProps {
  rating: string | null;
  fallback?: string;
}

/** Pill badge for an EXCELLENT / GOOD / AVERAGE / POOR rating. */
export function RatingBadge({ rating, fallback = "—" }: RatingBadgeProps) {
  if (!rating) {
    return <span className="text-caption text-ios-foreground-faint">{fallback}</span>;
  }
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider border"
      style={getRatingBadgeStyle(rating)}
    >
      {rating}
    </span>
  );
}