import { Suspense } from "react";
import Link from "next/link";
import {
  MessageSquare,
  TrendingUp,
  CalendarDays,
  CalendarCheck,
  Star,
  ThumbsUp,
  ThumbsDown,
  SmilePlus,
  Users,
  Award,
  Clock,
  ClipboardList,
  PackageCheck,
} from "lucide-react";
import { getDashboardStats, getInsights, getAlertsData, getAnalyticsData, getBranchList, getOperationalWidgets } from "@/features/dashboard/actions";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { InsightCard } from "./_components/insight-card";
import { AlertCard } from "./_components/alert-card";
import { ChartsSection } from "./_components/charts-section";
import { DashboardFilterBar } from "@/components/dashboard/dashboard-filter-bar";
import { Bone, KpiCardSkeleton } from "../_components/skeleton";

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

  const cards = [
    { title: "Total Feedback", value: stats.totalFeedback, icon: MessageSquare, subtext: "Filtered period" },
    { title: "Feedback Today", value: stats.feedbackToday, icon: TrendingUp, trend: stats.feedbackToday > 0 ? "up" : "neutral", change: "Today", subtext: "vs yesterday" },
    { title: "This Week", value: stats.feedbackThisWeek, icon: CalendarDays, subtext: "Weekly count" },
    { title: "This Month", value: stats.feedbackThisMonth, icon: CalendarCheck, subtext: "Monthly count" },
    { title: "Average Rating", value: stats.averageRating.toFixed(1), icon: Star, trend: stats.averageRating >= 4 ? "up" : stats.averageRating >= 3 ? "neutral" : "down", change: `${stats.averageRating.toFixed(1)}/5`, subtext: "Overall" },
    { title: "Positive Feedback", value: `${stats.positiveFeedback}%`, icon: ThumbsUp, trend: stats.positiveFeedback >= 70 ? "up" : "down", change: `${stats.positiveFeedback}%` },
    { title: "Negative Feedback", value: `${stats.negativeFeedback}%`, icon: ThumbsDown, trend: stats.negativeFeedback <= 20 ? "up" : "down", change: `${stats.negativeFeedback}%` },
    { title: "Net Satisfaction", value: stats.netSatisfactionScore, icon: SmilePlus, trend: stats.netSatisfactionScore >= 50 ? "up" : "down", change: `${stats.netSatisfactionScore}` },
    { title: "Returning Guests", value: `${stats.returningGuestPercentage}%`, icon: Users, subtext: "Estimated" },
    { title: "Recommendation Rate", value: `${stats.recommendationRate}%`, icon: Award, trend: stats.recommendationRate >= 70 ? "up" : "down", change: `${stats.recommendationRate}%` },
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
      subtext: `${widgets.pendingApprovals.discounts} discounts · ${widgets.pendingApprovals.entertainments} entertainment`,
      href: "/dashboard/guest-offers",
    },
    {
      title: "Manager Reports Today",
      value: widgets.managerReportsSubmittedToday,
      icon: ClipboardList,
      subtext: "submitted today",
      href: "/dashboard/manager-report",
    },
    {
      title: "Inventory This Month",
      value: widgets.inventoryThisMonth.branchesWithStatement,
      icon: PackageCheck,
      subtext: `${widgets.inventoryThisMonth.submitted} submitted · ${widgets.inventoryThisMonth.draft} draft`,
      href: "/dashboard/inventory",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Link key={card.title} href={card.href}>
          <div className="glass-card p-5 rounded-3xl hover:bg-ios-border-subtle/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">{card.title}</span>
              <card.icon size={18} className="text-ios-primary" />
            </div>
            <p className="text-display font-extrabold text-ios-foreground">{card.value}</p>
            <p className="text-caption text-ios-foreground-subtle mt-1">{card.subtext}</p>
          </div>
        </Link>
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
          <div className="col-span-full text-center py-12">
            <p className="text-ios-foreground-subtle font-medium text-body">Not enough data for insights yet.</p>
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-subtitle font-bold text-ios-foreground mb-4 tracking-tight">Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <AlertCard key={i} severity={alert.severity} title={alert.title} message={alert.message} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

async function DashboardCharts({ dateFrom, dateTo, branchId }: { dateFrom?: string; dateTo?: string; branchId?: string }) {
  const analytics = await getAnalyticsData(dateFrom, dateTo, branchId);
  return <ChartsSection data={analytics} />;
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
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Executive Overview</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">Real-time feedback performance across all branches</p>
      </div>

      <DashboardFilterBar branches={branches} basePath="/dashboard" />

      <Suspense key={`kpi-${filterKey}`} fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <KpiCardSkeleton key={i} />)}
        </div>
      }>
        <KpiGrid dateFrom={dateFrom} dateTo={dateTo} branchId={branchId} />
      </Suspense>

      <div className="mt-8">
        <h2 className="text-subtitle font-bold text-ios-foreground mb-4 tracking-tight">Daily Operations</h2>
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card h-32 rounded-3xl" />
            ))}
          </div>
        }>
          <OperationalSection />
        </Suspense>
      </div>

      <div className="mt-8">
        <h2 className="text-subtitle font-bold text-ios-foreground mb-4 tracking-tight">Intelligence & Insights</h2>
        <Suspense key={`insights-${filterKey}`} fallback={
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-5 rounded-3xl">
                <Bone className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        }>
          <InsightsSection dateFrom={dateFrom} dateTo={dateTo} branchId={branchId} />
        </Suspense>
      </div>

      <div className="mt-8">
        <h2 className="text-subtitle font-bold text-ios-foreground mb-4 tracking-tight">Performance Analytics</h2>
        <Suspense key={`charts-${filterKey}`} fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="glass-card h-[400px] rounded-4xl" />
            <div className="grid grid-rows-2 gap-6">
              <div className="glass-card rounded-4xl" />
              <div className="glass-card rounded-4xl" />
            </div>
          </div>
        }>
          <DashboardCharts dateFrom={dateFrom} dateTo={dateTo} branchId={branchId} />
        </Suspense>
      </div>
    </div>
  );
}

export default function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <Suspense fallback={
      <div className="space-y-8 pb-8">
        <div>
          <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Executive Overview</h1>
          <p className="text-subtitle text-ios-foreground-muted mt-1">Real-time feedback performance across all branches</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <KpiCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <OverviewContent searchParams={props.searchParams} />
    </Suspense>
  );
}
