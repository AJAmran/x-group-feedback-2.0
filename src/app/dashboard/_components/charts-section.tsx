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

type AnalyticsData = {
  trend: { month: string; avgRating: number; count: number }[];
  ratingDistribution: Record<string, number>;
  categories: { name: string; average: number }[];
  sentiment: { positive: number; neutral: number; negative: number; total: number };
};

const COLORS = {
  positive: "var(--color-ios-success)",
  neutral: "var(--color-ios-warning)",
  negative: "var(--color-ios-error)",
};

export function ChartsSection({ data }: { data: AnalyticsData }) {
  // Format sentiment data
  const sentimentData = [
    { name: "Positive", value: data.sentiment.positive, color: COLORS.positive },
    { name: "Neutral", value: data.sentiment.neutral, color: COLORS.neutral },
    { name: "Negative", value: data.sentiment.negative, color: COLORS.negative },
  ].filter((d) => d.value > 0);

  // Format ratings
  const distributionData = [
    { name: "Excellent", value: data.ratingDistribution.EXCELLENT || 0 },
    { name: "Good", value: data.ratingDistribution.GOOD || 0 },
    { name: "Average", value: data.ratingDistribution.AVERAGE || 0 },
    { name: "Poor", value: data.ratingDistribution.POOR || 0 },
    { name: "Very Poor", value: data.ratingDistribution.VERY_POOR || 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Trend Chart */}
      <div className="glass-card p-6 rounded-4xl">
        <div className="mb-6">
          <h3 className="text-subtitle font-bold text-ios-foreground">Feedback Trend</h3>
          <p className="text-caption text-ios-foreground-subtle mt-1">Average rating over the last 6 months</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-ios-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-ios-primary)" stopOpacity={0} />
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
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                  backgroundColor: 'var(--color-ios-background)',
                  color: 'var(--color-ios-foreground)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="avgRating" 
                name="Avg Rating"
                stroke="var(--color-ios-primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAvg)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment & Distribution Grid */}
      <div className="grid grid-rows-2 gap-6">
        
        {/* Rating Distribution */}
        <div className="glass-card p-6 rounded-4xl">
          <div className="mb-2">
            <h3 className="text-subtitle font-bold text-ios-foreground">Rating Distribution</h3>
          </div>
          <div className="h-[140px] w-full">
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
                <Tooltip cursor={{fill: 'var(--color-ios-border-subtle)', opacity: 0.4}} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="value" fill="var(--color-ios-primary)" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="glass-card p-6 rounded-4xl flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 w-full text-center sm:text-left">
            <h3 className="text-subtitle font-bold text-ios-foreground mb-1">Sentiment Breakdown</h3>
            <p className="text-caption text-ios-foreground-subtle mb-4">AI-driven analysis based on user rating trends.</p>
            <div className="flex flex-col gap-2">
              {sentimentData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-ios-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-[120px] h-[120px] shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
