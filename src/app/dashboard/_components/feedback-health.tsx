"use client";

import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Gauge, Award } from "lucide-react";
import { useMemo } from "react";

type Stats = {
  totalFeedback?: number;
  positiveFeedback: number;
  negativeFeedback: number;
  netSatisfactionScore: number;
  recommendationRate: number;
};

type TrendPoint = { month: string; avgRating: number };

interface Props {
  stats: Stats;
  trend?: TrendPoint[];
}

const POSITIVE = "oklch(55% 0.13 155)";
const POSITIVE_LIGHT = "oklch(70% 0.13 160)";
const NEGATIVE = "oklch(54% 0.17 27)";
const NEGATIVE_LIGHT = "oklch(66% 0.15 30)";
const NAVY = "oklch(var(--xg-primary))";
const GOLD = "oklch(var(--xg-gold))";
const GOLD_LIGHT = "oklch(74% 0.14 85)";
const WARNING = "oklch(64% 0.15 72)";
const TRACK = "oklch(60% 0.02 270 / 0.14)";

function Sparkline({ data, stroke }: { data: TrendPoint[]; stroke: string }) {
  const pts = useMemo(() => {
    if (!data || data.length < 2) return [] as { x: number; y: number }[];
    const w = 120;
    const h = 28;
    const pad = 2;
    const min = Math.min(...data.map((d) => d.avgRating));
    const max = Math.max(...data.map((d) => d.avgRating));
    const span = max - min || 1;
    return data.map((d, i) => ({
      x: pad + (i / (data.length - 1)) * (w - pad * 2),
      y: h - pad - ((d.avgRating - min) / span) * (h - pad * 2),
    }));
  }, [data]);

  if (pts.length < 2) return null;
  const pointsStr = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const first = pts[0];
  const last = pts[pts.length - 1];

  return (
    <svg width={120} height={28} viewBox="0 0 120 28" className="block" aria-hidden="true">
      <polyline points={pointsStr} fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      <circle cx={first.x} cy={first.y} r={2} fill={stroke} />
      <circle cx={last.x} cy={last.y} r={2.2} fill={stroke} />
    </svg>
  );
}

function Ring({
  value,
  size = 148,
  strokeWidth = 11,
  from,
  to,
  track,
  children,
  label,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  from: string;
  to: string;
  track?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track || TRACK} strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#ring-${label})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function NetGauge({ value }: { value: number }) {
  const W = 232;
  const H = 160;
  const cx = W / 2;
  const cy = 126;
  const r = 92;
  const stroke = 13;
  const nps = Math.max(-100, Math.min(100, value));
  const f = (nps + 100) / 200; // 0 = -100 (left) … 1 = +100 (right)

  // Map the value onto the top semicircle. Screen (SVG) angle is measured from
  // +x (right) toward +y (down): -100 → 180° (left), 0 → 270° (top),
  // +100 → 360° (right). So θ = π(1 + f).
  const angle = useMemo(() => Math.PI * (1 + f), [f]);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Value point on the track centreline.
  const vx = cx + r * cos;
  const vy = cy + r * sin;

  // Full track: left → over the top → right. On-screen that sweep is clockwise
  // (9 o'clock → 12 → 3), which in SVG's y-down plane is sweep-flag 1.
  const trackPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  // Coloured arc: from left end over the top up to the value. Always ≤ 180°,
  // so large-arc-flag is 0 and the sweep stays clockwise over the top.
  const arcPath = f <= 0.001
    ? ""
    : `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${vx.toFixed(2)} ${vy.toFixed(2)}`;

  // Needle tip — a touch shorter than the track so it reads inside the scale.
  const needleLen = r - 17;
  const nx = cx + needleLen * cos;
  const ny = cy + needleLen * sin;
  // Entrance pose: needle at neutral (12 o'clock).
  const homeX = cx;
  const homeY = cy - needleLen;

  // Small scale ticks: -100, -50, 0, +50, +100.
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((tf) => {
    const a = Math.PI * (1 - tf);
    const outer = r + stroke / 2 + 4;
    const inner = outer - 6;
    return {
      x1: cx + inner * Math.cos(a),
      y1: cy - inner * Math.sin(a),
      x2: cx + outer * Math.cos(a),
      y2: cy - outer * Math.sin(a),
    };
  });

  // Baseline labels aligned under the arc ends.
  const labels = [
    { x: cx - r, text: "-100" },
    { x: cx, text: "0" },
    { x: cx + r, text: "+100" },
  ];

  return (
    <div
      className="relative mx-auto w-full max-w-[232px]"
      role="img"
      aria-label={`Net satisfaction ${nps} on a -100 to +100 scale`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={NEGATIVE_LIGHT} />
            <stop offset="35%" stopColor={NEGATIVE} />
            <stop offset="50%" stopColor={WARNING} />
            <stop offset="65%" stopColor={POSITIVE} />
            <stop offset="100%" stopColor={POSITIVE_LIGHT} />
          </linearGradient>
        </defs>

        {/* Baseline connector — grounds the gauge visually */}
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={TRACK} strokeWidth={1.5} />

        {/* Track */}
        <path d={trackPath} fill="none" stroke={TRACK} strokeWidth={stroke} strokeLinecap="round" />

        {/* Scale ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="oklch(46% 0.02 270 / 0.55)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}

        {/* Coloured value arc */}
        {arcPath && (
          <motion.path
            d={arcPath}
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        )}

        {/* Value marker dot on the arc */}
        <circle cx={vx} cy={vy} r={4} fill={NAVY} />
        <circle cx={vx} cy={vy} r={7.5} fill="none" stroke={NAVY} strokeWidth={1.5} opacity={0.35} />

        {/* Needle */}
        <motion.line
          x1={cx}
          y1={cy}
          initial={{ x2: homeX, y2: homeY, opacity: 0 }}
          animate={{ x2: nx, y2: ny, opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          stroke={NAVY}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5.5} fill={NAVY} />
        <circle cx={cx} cy={cy} r={2} fill="#fff" />

        {/* Baseline labels */}
        {labels.map((l) => (
          <text
            key={l.text}
            x={l.x}
            y={cy + 22}
            textAnchor="middle"
            fontSize={10}
            fill="oklch(48% 0.02 270)"
            fontWeight={700}
          >
            {l.text}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function FeedbackHealth({ stats, trend }: Props) {
  const trendData = trend && trend.length > 1 ? trend : undefined;
  const totalFeedback = stats.totalFeedback ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Positive — hero ring */}
      <div className="glass-card p-5 card-lift">
        <div className="flex items-center gap-2">
          <div className="icon-tile-sm bg-xg-positive-soft border-xg-positive/25 text-xg-positive">
            <ThumbsUp size={15} strokeWidth={2.2} />
          </div>
          <p className="card-heading">Positive Feedback</p>
        </div>
        <div className="mt-4">
          <Ring value={stats.positiveFeedback} from={POSITIVE} to={POSITIVE_LIGHT} label="positive-feedback">
            <span className="text-title font-extrabold text-ios-foreground leading-none tabular-nums">{stats.positiveFeedback}%</span>
            <span className="text-[0.6875rem] text-ios-foreground-faint mt-1 font-medium">Excellent or good</span>
          </Ring>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <p className="text-[0.6875rem] text-ios-foreground-faint font-medium">Share of {totalFeedback} responses</p>
          {trendData && <Sparkline data={trendData} stroke={POSITIVE} />}
        </div>
      </div>

      {/* Negative — ring */}
      <div className="glass-card p-5 card-lift">
        <div className="flex items-center gap-2">
          <div className="icon-tile-sm bg-xg-negative-soft border-xg-negative/25 text-xg-negative">
            <ThumbsDown size={15} strokeWidth={2.2} />
          </div>
          <p className="card-heading">Negative Feedback</p>
        </div>
        <div className="mt-4">
          <Ring value={stats.negativeFeedback} size={152} from={NEGATIVE} to={NEGATIVE_LIGHT} label="negative-feedback">
            <span className="text-title font-extrabold text-ios-foreground leading-none tabular-nums">{stats.negativeFeedback}%</span>
            <span className="text-[0.6875rem] text-ios-foreground-faint mt-1 font-medium">Poor or very poor</span>
          </Ring>
        </div>
        <p className="mt-4 text-[0.6875rem] text-ios-foreground-faint font-medium">
          {stats.negativeFeedback <= 20 ? "Within healthy range" : "Needs attention"}
        </p>
      </div>

      {/* Net satisfaction — semicircle gauge */}
      <div className="glass-card p-5 card-lift sm:col-span-2 xl:col-span-1">
        <div className="flex items-center gap-2">
          <div className="icon-tile-sm bg-xg-primary-soft border-xg-primary/25 text-xg-primary">
            <Gauge size={15} strokeWidth={2.2} />
          </div>
          <p className="card-heading">Net Satisfaction</p>
        </div>
        <div className="mt-3 -mb-1">
          <NetGauge value={stats.netSatisfactionScore} />
        </div>
        <div className="mt-2 text-center">
          <p className="text-title font-extrabold text-ios-foreground leading-none tabular-nums">{stats.netSatisfactionScore}</p>
          <p className="text-[0.6875rem] text-ios-foreground-faint mt-1 font-medium">NPS-style · -100 to +100</p>
        </div>
      </div>

      {/* Recommendation — donut */}
      <div className="glass-card p-5 card-lift">
        <div className="flex items-center gap-2">
          <div className="icon-tile-sm bg-xg-gold-soft border-xg-gold/30 text-xg-gold">
            <Award size={15} strokeWidth={2.2} />
          </div>
          <p className="card-heading">Recommendation Rate</p>
        </div>
        <div className="mt-4">
          <Ring value={stats.recommendationRate} from={GOLD} to={GOLD_LIGHT} label="recommendation">
            <span className="text-title font-extrabold text-ios-foreground leading-none tabular-nums">{stats.recommendationRate}%</span>
            <span className="text-[0.6875rem] text-ios-foreground-faint mt-1 font-medium">Would return</span>
          </Ring>
        </div>
        <div className="mt-4 text-center">
          <p className="text-[0.6875rem] text-ios-foreground-faint font-medium">Of your guests</p>
        </div>
      </div>
    </div>
  );
}