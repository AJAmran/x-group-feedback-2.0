import type { LucideIcon } from "lucide-react";

type OpsTone = "primary" | "amber" | "green" | "red" | "gold";

interface OpsStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  tone?: OpsTone;
  className?: string;
}

const TONES: Record<OpsTone, { tile: string; glow: string }> = {
  primary: {
    tile: "bg-ios-primary/[0.09] border-ios-primary/15 text-ios-primary",
    glow: "from-ios-primary/20",
  },
  amber: {
    tile: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    glow: "from-amber-500/20",
  },
  green: {
    tile: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    glow: "from-emerald-500/20",
  },
  red: {
    tile: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
    glow: "from-red-500/20",
  },
  gold: {
    tile: "bg-[oklch(var(--ios-accent)/0.12)] border-[oklch(var(--ios-accent)/0.22)] text-[oklch(var(--ios-accent))]",
    glow: "from-[oklch(var(--ios-accent)/0.25)]",
  },
};

/** Shared KPI-style card for the Daily Operations pages. */
export function OpsStatCard({ icon: Icon, label, value, subtext, tone = "primary", className = "" }: OpsStatCardProps) {
  const t = TONES[tone];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-ios-border-subtle bg-surface-300 shadow-sm p-5 transition-colors duration-200 hover:border-ios-border hover:shadow-md ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-linear-to-br ${t.glow} to-transparent blur-2xl opacity-60`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-caption font-semibold uppercase tracking-[0.12em] text-ios-foreground-subtle leading-none truncate">
          {label}
        </p>
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${t.tile}`}>
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>
      <p className="relative mt-3.5 text-title font-extrabold tracking-tight text-ios-foreground leading-none tabular-nums">
        {value}
      </p>
      {subtext && (
        <p className="relative text-micro text-ios-foreground-faint font-medium mt-2.5 truncate">{subtext}</p>
      )}
    </div>
  );
}
