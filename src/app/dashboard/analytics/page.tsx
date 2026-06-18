import { Suspense } from "react";
import { getAnalyticsData } from "@/features/dashboard/actions";
import { AnalyticsCharts } from "./_components/analytics-charts";

async function AnalyticsContent() {
  const data = await getAnalyticsData();
  return <AnalyticsCharts {...data} />;
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Analytics</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">Advanced feedback analytics and performance metrics</p>
      </div>

      <Suspense fallback={
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-[1.5rem] animate-pulse">
              <div className="h-4 w-32 bg-ios-border-subtle rounded mb-6" />
              <div className="h-64 bg-ios-border-subtle rounded-xl" />
            </div>
          ))}
        </div>
      }>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
