"use client";

import dynamic from "next/dynamic";
import { ChartCardSkeleton } from "../../../_components/skeleton";

// Recharts (the charting engine) is heavy — split it out of the initial
// bundle so the page paints fast even on low-power devices.
const AnalyticsCharts = dynamic(
  () => import("./analytics-charts").then((m) => m.AnalyticsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => <ChartCardSkeleton key={i} />)}
      </div>
    ),
  }
);

export function AnalyticsChartsLazy(props: {
  trend: { month: string; avgRating: number; count: number }[];
  ratingDistribution: Record<string, number>;
  categories: { name: string; average: number }[];
  sentiment: { positive: number; neutral: number; negative: number; total: number };
  branchComparison: { companyAvg: number; branches: { code: string; average: number }[] };
  daily: { date: string; count: number }[];
}) {
  return <AnalyticsCharts {...props} />;
}