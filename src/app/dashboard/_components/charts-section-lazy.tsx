"use client";

import dynamic from "next/dynamic";
import { ChartCardSkeleton } from "../../_components/skeleton";

// Recharts is the heaviest client dependency on this route. Loading it through
// a client-side dynamic import keeps the initial HTML/JS small on low-end
// devices — the charts hydrate and render after first paint.
const ChartsSection = dynamic(
  () => import("./charts-section").then((m) => m.ChartsSection),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCardSkeleton height="h-[400px]" />
        <div className="grid grid-rows-2 gap-6">
          <ChartCardSkeleton />
          <ChartCardSkeleton />
        </div>
      </div>
    ),
  }
);

type AnalyticsData = {
  trend: { month: string; avgRating: number; count: number }[];
  ratingDistribution: Record<string, number>;
  categories: { name: string; average: number }[];
  sentiment: { positive: number; neutral: number; negative: number; total: number };
  branchComparison: { companyAvg: number; branches: { code: string; average: number }[] };
  daily: { date: string; count: number }[];
};

export function ChartsSectionLazy({ data }: { data: AnalyticsData }) {
  return <ChartsSection data={data} />;
}
