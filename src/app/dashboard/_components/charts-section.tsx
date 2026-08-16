"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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

type AnalyticsData = {
  trend: { month: string; avgRating: number; count: number }[];
  ratingDistribution: Record<string, number>;
  categories: { name: string; average: number }[];
  sentiment: { positive: number; neutral: number; negative: number; total: number };
};

const GOLD = "oklch(77% 0.15 85)";

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

function BarTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-ios-border-subtle bg-ios-background/95 backdrop-blur px-3 py-2 shadow-lg text-micro">
      <p className="font-bold text-ios-foreground">{payload[0]?.name}</p>
      <p className="text-ios-foreground-subtle">
        Responses: <span className="font-semibold text-ios-foreground">{payload[0]?.value}</span>
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
    .map((name) => ({ name: ratingLabel(name), value: data.ratingDistribution[name] || 0 }))
    .filter((d) => d.value > 0);

  const sentimentTotal = data.sentiment.total || sentimentData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trend Chart */}
      <div className="glass-card p-6 rounded-3xl">
        <div className="mb-6">
          <h3 className="text-label font-bold text-ios-foreground uppercase tracking-[0.12em]">Feedback Trend</h3>
          <p className="text-caption text-ios-foreground-subtle mt-1">Average rating over the last 6 months</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={areaGradientId("avgRating")} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
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
                stroke={GOLD}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${areaGradientId("avgRating")})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment & Distribution Grid */}
      <div className="grid grid-rows-2 gap-6">
        {/* Rating Distribution */}
        <div className="glass-card p-6 rounded-3xl">
          <div className="mb-2">
            <h3 className="text-label font-bold text-ios-foreground uppercase tracking-[0.12em]">Rating Distribution</h3>
          </div>
          <div className="h-[140px] w-full flex items-center justify-center">
            {distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={80}
                    tick={{ fill: "var(--color-ios-foreground-subtle)", fontSize: 12 }}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "var(--color-ios-border-subtle)", opacity: 0.4 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {distributionData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={getRatingColor(entry.name.toUpperCase())}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-caption text-ios-foreground-faint italic">No rating data available.</p>
            )}
          </div>
        </div>

        {/* Sentiment Donut */}
        <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-6">
          <div className="w-[140px] h-[140px] shrink-0 relative">
            {sentimentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={62}
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
              <span className="text-micro text-ios-foreground-faint mt-1">Total</span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <h3 className="text-label font-bold text-ios-foreground mb-1 uppercase tracking-[0.12em]">Sentiment Breakdown</h3>
            <p className="text-caption text-ios-foreground-subtle mb-4">AI-driven analysis based on user rating trends.</p>
            <div className="flex flex-col gap-2.5">
              {sentimentData.map((item) => {
                const pct = sentimentTotal > 0 ? Math.round((item.value / sentimentTotal) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getSentimentColor(item.key) }} />
                      <span className="font-medium text-ios-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-micro text-ios-foreground-faint tabular-nums w-9 text-right">{pct}%</span>
                      <span className="font-bold tabular-nums w-8 text-right">{item.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}