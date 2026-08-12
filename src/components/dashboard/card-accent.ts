// Shared semantic accents for dashboard metric cards (KPI, operational).
// Keep icon tiles and progress bars in sync across components.

export type CardAccent = "navy" | "gold" | "green" | "lacquer" | "amber";

export interface CardAccentStyle {
  tile: string;
  bar: string;
}

export const CARD_ACCENTS: Record<CardAccent, CardAccentStyle> = {
  navy: {
    tile: "bg-ios-primary/10 border-ios-primary/15 text-ios-primary",
    bar: "bg-ios-primary",
  },
  gold: {
    tile: "bg-ios-accent/12 border-ios-accent/20 text-ios-accent",
    bar: "bg-ios-accent",
  },
  green: {
    tile: "bg-[oklch(42%_0.12_155/0.12)] border-[oklch(42%_0.12_155/0.22)] text-[oklch(42%_0.12_155)]",
    bar: "bg-[oklch(42%_0.12_155)]",
  },
  lacquer: {
    tile: "bg-[oklch(var(--lacquer)/0.12)] border-[oklch(var(--lacquer)/0.22)] text-[oklch(var(--lacquer))]",
    bar: "bg-[oklch(var(--lacquer))]",
  },
  amber: {
    tile: "bg-[oklch(52%_0.14_75/0.12)] border-[oklch(52%_0.14_75/0.22)] text-[oklch(52%_0.14_75)]",
    bar: "bg-[oklch(52%_0.14_75)]",
  },
};