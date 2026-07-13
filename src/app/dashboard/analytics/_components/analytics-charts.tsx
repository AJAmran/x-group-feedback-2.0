"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell, PieChart, Pie } from "recharts";
import {
  getRatingColor,
  getSentimentColor,
  getStableColor,
  SEQUENTIAL_COLORS,
  RATING_ORDER,
} from "@/lib/chart-theme";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 rounded-xl text-caption font-semibold shadow-xl">
        <p className="text-ios-foreground-muted mb-1">{label}</p>
        {payload.map((p, i: number) => (
          <p key={i} style={{ color: p.color }} className="text-label">
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface TrendData {
  month: string;
  avgRating: number;
  count: number;
}

interface AnalyticsProps {
  trend: TrendData[];
  ratingDistribution: Record<string, number>;
  categories: { name: string; average: number }[];
  branchComparison: { companyAvg: number; branches: { code: string; average: number }[] };
  sentiment: { positive: number; neutral: number; negative: number; total: number };
  daily: { date: string; count: number }[];
}

export function AnalyticsCharts({
  trend,
  ratingDistribution,
  categories,
  branchComparison,
  sentiment,
  daily,
}: AnalyticsProps) {
  const distData = RATING_ORDER
    .map((name) => ({ name, value: ratingDistribution[name] || 0 }))
    .filter((d) => d.value > 0);

  const sentimentData = [
    { name: "Positive", value: sentiment.positive, key: "positive" },
    { name: "Neutral", value: sentiment.neutral, key: "neutral" },
    { name: "Negative", value: sentiment.negative, key: "negative" },
  ];

  const primaryVar = "var(--color-ios-primary)";
  const accentVar = "var(--color-ios-accent)";

  const sortedBranches = [...branchComparison.branches].sort((a, b) => b.average - a.average).slice(0, 17);
  const maxDelta = sortedBranches.length > 0
    ? Math.max(...sortedBranches.map((b) => Math.abs(b.average - branchComparison.companyAvg)), 0.01)
    : 1;

  return (
    <div className="space-y-6">
      {/* Rating Trend */}
      <div className="glass-card p-6 rounded-[1.5rem]">
        <h3 className="text-label font-bold text-ios-foreground mb-4 uppercase tracking-[0.12em]">Rating Trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ios-border-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-ios-foreground-faint)" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "var(--color-ios-foreground-faint)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avgRating" stroke={primaryVar} strokeWidth={2.5} dot={{ fill: primaryVar }} name="Avg Rating" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Feedback Volume */}
      <div className="glass-card p-6 rounded-[1.5rem]">
        <h3 className="text-label font-bold text-ios-foreground mb-4 uppercase tracking-[0.12em]">Daily Feedback Volume</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="dailyVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentVar} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={accentVar} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ios-border-subtle)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--color-ios-foreground-faint)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--color-ios-foreground-faint)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke={accentVar} fill="url(#dailyVolumeGrad)" strokeWidth={2} name="Feedback" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="glass-card p-6 rounded-[1.5rem]">
          <h3 className="text-label font-bold text-ios-foreground mb-4 uppercase tracking-[0.12em]">Rating Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ios-border-subtle)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "var(--color-ios-foreground-faint)" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--color-ios-foreground-faint)" }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {distData.map((entry) => (
                    <Cell key={entry.name} fill={getRatingColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        <div className="glass-card p-6 rounded-[1.5rem]">
          <h3 className="text-label font-bold text-ios-foreground mb-4 uppercase tracking-[0.12em]">Category Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ios-border-subtle)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-ios-foreground-faint)" }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "var(--color-ios-foreground-faint)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                  {categories.map((entry) => (
                    <Cell key={entry.name} fill={getStableColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="glass-card p-6 rounded-[1.5rem]">
        <h3 className="text-label font-bold text-ios-foreground mb-4 uppercase tracking-[0.12em]">Sentiment Analysis</h3>
        <div className="flex flex-wrap items-center gap-8">
          <div className="h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {sentimentData.map((entry, i) => (
                    <Cell key={i} fill={getSentimentColor(entry.key)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {sentimentData.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getSentimentColor(s.key) }} />
                <span className="text-label font-semibold text-ios-foreground-muted">{s.name}</span>
                <span className="text-label font-bold text-ios-foreground">{s.value}</span>
                <span className="text-caption text-ios-foreground-faint">
                  ({sentiment.total ? Math.round((s.value / sentiment.total) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch Comparison */}
      <div className="glass-card p-6 rounded-[1.5rem]">
        <h3 className="text-label font-bold text-ios-foreground mb-4 uppercase tracking-[0.12em]">Branch Comparison</h3>
        <p className="text-caption text-ios-foreground-subtle mb-4 font-medium">Company Average: {branchComparison.companyAvg.toFixed(1)}/5</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedBranches}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ios-border-subtle)" />
              <XAxis dataKey="code" tick={{ fontSize: 10, fill: "var(--color-ios-foreground-faint)" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "var(--color-ios-foreground-faint)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                {sortedBranches.map((b) => {
                  const delta = (b.average - branchComparison.companyAvg) / maxDelta;
                  const normalized = Math.round(((delta + 1) / 2) * 4);
                  const idx = Math.max(0, Math.min(4, normalized));
                  return <Cell key={b.code} fill={SEQUENTIAL_COLORS[idx]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
