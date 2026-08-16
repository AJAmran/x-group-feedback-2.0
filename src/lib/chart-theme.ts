// Single source of truth for all chart colors in the dashboard
// All values use OKLCH for perceptual uniformity and glass-background legibility

// ─── Categorical Palette (13 colors) ────────────────────────
// For branches, multi-category data.
// Equal lightness (~56–66%) & chroma (~0.11–0.15) so no tone dominates;
// hues spread across the wheel (with light variation) so every branch stays distinct.
export const CHART_COLORS = [
  "oklch(62% 0.12 200)",   // teal
  "oklch(58% 0.14 255)",   // blue
  "oklch(57% 0.13 285)",   // violet
  "oklch(58% 0.14 325)",   // magenta
  "oklch(61% 0.13 5)",     // rose
  "oklch(63% 0.15 40)",    // orange
  "oklch(65% 0.14 75)",    // amber
  "oklch(66% 0.15 110)",   // lime
  "oklch(62% 0.14 145)",   // green
  "oklch(65% 0.12 165)",   // emerald
  "oklch(60% 0.11 195)",   // cyan
  "oklch(56% 0.13 270)",   // indigo
  "oklch(61% 0.14 345)",   // pink
] as const;

// ─── Rating Colors (5 tiers, ordered best → worst) ──────────
// Lightness decreases monotonically (68 → 51) so order is clear even in grayscale.
export const RATING_COLORS: Record<string, string> = {
  EXCELLENT: "oklch(68% 0.16 150)",
  GOOD: "oklch(64% 0.13 210)",
  AVERAGE: "oklch(62% 0.14 80)",
  POOR: "oklch(57% 0.15 45)",
};

export const RATING_ORDER = ["EXCELLENT", "GOOD", "AVERAGE", "POOR"] as const;

// ─── Sentiment Colors ───────────────────────────────────────
export const SENTIMENT_COLORS: Record<string, string> = {
  positive: "oklch(66% 0.14 165)",
  neutral: "oklch(62% 0.14 80)",
  negative: "oklch(53% 0.17 25)",
};

// ─── Sequential / Diverging Palette (5-step) ────────────────
// For score heatmaps, distance-from-baseline, NPS-like data.
export const SEQUENTIAL_COLORS = [
  "oklch(53% 0.17 25)",   // low (deep red)
  "oklch(58% 0.15 45)",   // mid-low (orange)
  "oklch(62% 0.14 80)",   // mid (amber)
  "oklch(64% 0.13 190)",  // mid-high (teal)
  "oklch(68% 0.16 150)",  // high (green)
] as const;

// ─── Helpers ────────────────────────────────────────────────
export function getRatingColor(key: string): string {
  return RATING_COLORS[key] || "oklch(60% 0.05 270)";
}

export function getSentimentColor(key: string): string {
  return SENTIMENT_COLORS[key] || "oklch(60% 0.05 270)";
}

export function getBranchColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

// Assign a stable color to any string key by hashing
export function getStableColor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return getBranchColor(Math.abs(hash));
}

// ─── Rating Badge Styles ────────────────────────────────────
// Returns inline style objects for UI badges (e.g., feedback table pills)
export function getRatingBadgeStyle(key: string): {
  backgroundColor: string;
  color: string;
  borderColor: string;
} {
  const color = RATING_COLORS[key];
  if (!color) {
    return {
      backgroundColor: "var(--color-ios-border-subtle)",
      color: "var(--color-ios-foreground-subtle)",
      borderColor: "transparent",
    };
  }
  const base = color.replace("oklch(", "").replace(")", "");
  return {
    backgroundColor: `oklch(${base} / 0.15)`,
    color,
    borderColor: `oklch(${base} / 0.25)`,
  };
}

// ─── Shared Gradient Generator ──────────────────────────────
export function areaGradientId(name: string): string {
  return `chartGradient-${name}`;
}
