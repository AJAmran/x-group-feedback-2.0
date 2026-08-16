import { Suspense } from "react";
import {
  MessageSquare,
  TrendingUp,
  CalendarDays,
  CalendarCheck,
  Star,
  ThumbsUp,
  ThumbsDown,
  SmilePlus,
  Award,
  Clock,
  ClipboardList,
  PackageCheck,
  LayoutDashboard,
} from "lucide-react";
import { getDashboardStats, getInsights, getAlertsData, getAnalyticsData, getBranchList, getOperationalWidgets } from "@/features/dashboard/actions";
import { KpiCard, type KpiCardProps } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { SectionHeader } from "@/components/dashboard/section-header";
import { QuickLinkCard } from "@/components/dashboard/quick-link-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { InsightCard } from "./_components/insight-card";
import { AlertCard } from "./_components/alert-card";
import { ChartsSectionLazy } from "./_components/charts-section-lazy";
import { DashboardFilterBar } from "@/components/dashboard/dashboard-filter-bar";
import { KpiCardSkeleton, ListCardSkeleton, ChartCardSkeleton } from "../_components/skeleton";

interface BranchSummary {
  id: string;
  code: string;
  name: string;
}

function resolveBranchId(branchCode: string | undefined, branches: BranchSummary[]): string | undefined {
  if (!branchCode) return undefined;
  const matched = branches.find((b) => b.code === branchCode || b.id === branchCode);
  return matched?.id;
}

async function KpiGrid({ dateFrom, dateTo, branchId }: { dateFrom?: string; dateTo?: string; branchId?: string }) {
  const stats = await getDashboardStats(dateFrom, dateTo, branchId);

  const cards: Omit<KpiCardProps, "key">[] = [
    { title: "Total Feedback", value: stats.totalFeedback, icon: MessageSquare, accent: "navy", subtext: "In the selected period" },
    { title: "Feedback Today", value: stats.feedbackToday, icon: TrendingUp, accent: "green", trend: stats.feedbackToday >= stats.feedbackThisWeek / Math.max(7, 1) ? "up" : "neutral", change: "Today", subtext: "Leveled for the week" },
    { title: "Feedback This Week", value: stats.feedbackThisWeek, icon: CalendarDays, accent: "navy", subtext: "Since Monday" },
    { title: "Feedback This Month", value: stats.feedbackThisMonth, icon: CalendarCheck, accent: "navy", subtext: "Since the 1st" },
    { title: "Average Rating", value: stats.averageRating.toFixed(1), icon: Star, accent: "gold", trend: stats.averageRating >= 4.5 ? "up" : stats.averageRating >= 3 ? "neutral" : "down", change: `${stats.averageRating.toFixed(1)}/5`, subtext: "Across all categories", progress: (stats.averageRating / 5) * 100 },
    { title: "Positive Feedback", value: `${stats.positiveFeedback}%`, icon: ThumbsUp, accent: "green", trend: stats.positiveFeedback >= 70 ? "up" : "down", change: `${stats.positiveFeedback}%`, subtext: "Excellent or good", progress: stats.positiveFeedback },
    {
      title: "Negative Feedback",
      value: `${stats.negativeFeedback}%`,
      icon: ThumbsDown,
      accent: "lacquer",
      trend: stats.negativeFeedback <= 20 ? "up" : "down",
      change: `${stats.negativeFeedback}%`,
      subtext: "Poor or very poor",
      progress: 100 - stats.negativeFeedback,
    },
    { title: "Net Satisfaction", value: stats.netSatisfactionScore, icon: SmilePlus, accent: "navy", trend: stats.netSatisfactionScore >= 50 ? "up" : "down", change: `${stats.netSatisfactionScore}`, subtext: "NPS-style score", progress: Math.max(0, stats.netSatisfactionScore) },
    { title: "Recommendation Rate", value: `${stats.recommendationRate}%`, icon: Award, accent: "gold", trend: stats.recommendationRate >= 70 ? "up" : "down", change: `${stats.recommendationRate}%`, subtext: "Of your guests", progress: stats.recommendationRate },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </div>
  );
}

async function OperationalSection() {
  const widgets = await getOperationalWidgets();

  const cards = [
    {
      title: "Pending Approvals",
      value: widgets.pendingApprovals.total,
      icon: Clock,
      accent: "amber" as const,
      attention: widgets.pendingApprovals.total > 0,
      attentionLabel: "Needs approval",
      subtext: `${widgets.pendingApprovals.discounts} discounts · ${widgets.pendingApprovals.entertainments} entertainment`,
      href: "/dashboard/guest-offers",
    },
    {
      title: "Manager Reports Today",
      value: widgets.managerReportsSubmittedToday,
      icon: ClipboardList,
      accent: "navy" as const,
      subtext: "Submitted today",
      href: "/dashboard/manager-report",
    },
    {
      title: "Inventory This Month",
      value: widgets.inventoryThisMonth.branchesWithStatement,
      icon: PackageCheck,
      accent: "green" as const,
      subtext: `${widgets.inventoryThisMonth.submitted} submitted · ${widgets.inventoryThisMonth.draft} draft`,
      href: "/dashboard/inventory",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <QuickLinkCard key={card.title} {...card} />
      ))}
    </div>
  );
}

async function InsightsSection({ dateFrom, dateTo, branchId }: { dateFrom?: string; dateTo?: string; branchId?: string }) {
  const insights = await getInsights(dateFrom, dateTo, branchId);
  const alerts = await getAlertsData(dateFrom, dateTo, branchId);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <InsightCard key={i} type={insight.type} message={insight.message} />
        ))}
        {insights.length === 0 && (
          <div className="col-span-full glass-card rounded-3xl">
            <EmptyState
              icon={SmilePlus}
              title="Not enough data for insights yet"
              description="Insights will appear once sufficient feedback is collected for the selected period."
            />
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Alerts" description="Items requiring attention" />
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <AlertCard key={i} severity={alert.severity} title={alert.title} message={alert.message} />
            ))}
          </div>
        </div>
      )}
      {alerts.length === 0 && (
        <div className="mt-8">
          <SectionHeader title="Alerts" description="Items requiring attention" />
          <div className="glass-card-plain rounded-2xl">
            <EmptyState
              icon={MessageSquare}
              title="All clear"
              description="No alerts for the selected period — everything looks healthy."
            />
          </div>
        </div>
      )}
    </>
  );
}

async function DashboardCharts({ dateFrom, dateTo, branchId }: { dateFrom?: string; dateTo?: string; branchId?: string }) {
  const analytics = await getAnalyticsData(dateFrom, dateTo, branchId);
  return <ChartsSectionLazy data={analytics} />;
}

async function OverviewContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const dateFrom = params.dateFrom;
  const dateTo = params.dateTo;
  const branchCode = params.branch;
  const branches = await getBranchList();
  const branchId = resolveBranchId(branchCode, branches);
  const filterKey = `${dateFrom || ""}|${dateTo || ""}|${branchCode || ""}`;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Executive Overview"
        description="Real-time feedback performance across all branches"
      />

      <DashboardFilterBar branches={branches} basePath="/dashboard" />

      <section>
        <SectionHeader title="Daily Operations" description="Quick access to operational workflows" />
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <KpiCardSkeleton key={i} />)}
          </div>
        }>
          <OperationalSection />
        </Suspense>
      </section>

      <section>
        <SectionHeader title="Key Metrics" description="Performance indicators for the selected period" />
        <Suspense key={`kpi-${filterKey}`} fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <KpiCardSkeleton key={i} />)}
          </div>
        }>
          <KpiGrid dateFrom={dateFrom} dateTo={dateTo} branchId={branchId} />
        </Suspense>
      </section>

      <section>
        <SectionHeader title="Intelligence & Insights" description="Automated analysis from feedback data" />
        <Suspense key={`insights-${filterKey}`} fallback={<ListCardSkeleton rows={3} />}>
          <InsightsSection dateFrom={dateFrom} dateTo={dateTo} branchId={branchId} />
        </Suspense>
      </section>

      <section>
        <SectionHeader title="Performance Analytics" description="Trends and distribution charts" />
        <Suspense key={`charts-${filterKey}`} fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCardSkeleton height="h-[400px]" />
            <div className="grid grid-rows-2 gap-6">
              <ChartCardSkeleton />
              <ChartCardSkeleton />
            </div>
          </div>
        }>
          <DashboardCharts dateFrom={dateFrom} dateTo={dateTo} branchId={branchId} />
        </Suspense>
      </section>
    </div>
  );
}

export default function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <Suspense fallback={
      <div className="space-y-6 pb-8">
        <PageHeader
          icon={LayoutDashboard}
          title="Executive Overview"
          description="Real-time feedback performance across all branches"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <KpiCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <OverviewContent searchParams={props.searchParams} />
    </Suspense>
  );
}
