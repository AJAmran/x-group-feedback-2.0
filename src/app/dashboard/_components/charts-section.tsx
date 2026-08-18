"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getSentimentColor,
  getRatingColor,
  areaGradientId,
  RATING_ORDER,
} from "@/lib/chart-theme";
import { CalendarRange, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { CardHeader } from "@/components/dashboard/card-header";

type AnalyticsData = {
  trend: { month: string; avgRating: number; count: number }[];
  ratingDistribution: Record<string, number>;
  categories: { name: string; average: number }[];
  sentiment: { positive: number; neutral: number; negative: number; total: number };
};

const PRIMARY = "oklch(var(--xg-primary))";

function ratingLabel(key: string): string {
  const label = RATING_ORDER.find((r) => r === key);
  return label ? label.charAt(0) + label.slice(1).toLowerCase() : key;
}

interface TooltipItem {
  value?: string | number;
  name?: string;
  payload?: { count?: number };
}

interface TooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipItem[];
}

function TrendTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const rating = payload[0]?.value;
  const count = payload[0]?.payload?.count;
  return (
    <div className="rounded-xl border border-ios-border-subtle bg-ios-background/95 backdrop-blur px-3 py-2 shadow-lg text-micro">
      <p className="font-bold text-ios-foreground">{label}</p>
      <p className="text-ios-foreground-subtle mt-0.5">
        Avg rating: <span className="font-semibold text-ios-foreground">{rating}</span>
      </p>
      <p className="text-ios-foreground-subtle">
        Responses: <span className="font-semibold text-ios-foreground">{count}</span>
      </p>
    </div>
  );
}

function PieTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-ios-border-subtle bg-ios-background/95 backdrop-blur px-3 py-2 shadow-lg text-micro">
      <p className="font-bold text-ios-foreground">{p?.name}</p>
      <p className="text-ios-foreground-subtle">
        Responses: <span className="font-semibold text-ios-foreground">{p?.value}</span>
      </p>
    </div>
  );
}

export function ChartsSection({ data }: { data: AnalyticsData }) {
  const sentimentData = [
    { name: "Positive", value: data.sentiment.positive, key: "positive" },
    { name: "Neutral", value: data.sentiment.neutral, key: "neutral" },
    { name: "Negative", value: data.sentiment.negative, key: "negative" },
  ].filter((d) => d.value > 0);

  const distributionData = RATING_ORDER
    .map((name) => ({ name: ratingLabel(name), key: name, value: data.ratingDistribution[name] || 0 }))
    .filter((d) => d.value > 0);

  const distributionTotal = distributionData.reduce((sum, d) => sum + d.value, 0);
  const sentimentTotal = data.sentiment.total || sentimentData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Feedback Trend — hero area chart */}
      <div className="glass-card p-6 lg:col-span-2 card-lift">
        <CardHeader
          icon={CalendarRange}
          title="Feedback Trend"
          hint="Average rating over time"
          variant="inset"
          action={
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-xg-primary-soft border border-xg-primary/25 text-xg-primary text-[0.6875rem] font-bold">
              Last 6 Months
            </span>
          }
        />
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={areaGradientId("avgRating")} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ios-border-subtle)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-ios-foreground-subtle)", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                domain={[0, 5]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-ios-foreground-subtle)", fontSize: 12 }}
              />
              <Tooltip content={<TrendTooltip />} />
              <Area
                type="monotone"
                dataKey="avgRating"
                name="Avg Rating"
                stroke={PRIMARY}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${areaGradientId("avgRating")})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right column: sentiment donut + rating distribution */}
      <div className="grid grid-rows-2 gap-4">
        {/* Sentiment Donut */}
        <div className="glass-card p-6 card-lift flex flex-col">
          <CardHeader icon={PieIcon} title="Sentiment Breakdown" variant="inset" />
          <div className="flex items-center gap-5 flex-1 min-h-0">
            <div className="w-[128px] h-[128px] shrink-0 relative">
              {sentimentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getSentimentColor(entry.key)} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-micro text-ios-foreground-faint">No data</span>
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-title font-extrabold text-ios-foreground tabular-nums leading-none">
                  {sentimentTotal}
                </span>
                <span className="text-[0.6875rem] text-ios-foreground-faint mt-1 font-medium">Total</span>
              </div>
            </div>
            <div className="flex-1 w-full min-w-0 space-y-2.5">
              {sentimentData.map((item) => {
                const pct = sentimentTotal > 0 ? Math.round((item.value / sentimentTotal) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getSentimentColor(item.key) }} />
                      <span className="text-sm font-medium text-ios-foreground truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-micro text-ios-foreground-faint tabular-nums w-9 text-right">{pct}%</span>
                      <span className="text-sm font-bold tabular-nums w-8 text-right">{item.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="glass-card p-6 card-lift flex flex-col">
          <CardHeader icon={BarChart3} title="Rating Distribution" variant="inset" />
          <div className="flex-1 min-h-0 flex flex-col justify-center">
            {distributionData.length > 0 ? (
              <div className="space-y-4">
                {distributionData.map((d) => {
                  const pct = distributionTotal > 0 ? Math.round((d.value / distributionTotal) * 100) : 0;
                  return (
                    <div key={d.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-ios-foreground">{d.name}</span>
                        <span className="text-micro text-ios-foreground-faint tabular-nums">
                          {pct}% · <span className="font-bold text-ios-foreground">{d.value}</span>
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-ios-border-subtle/60 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: getRatingColor(d.key) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-caption text-ios-foreground-faint italic">No rating data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}