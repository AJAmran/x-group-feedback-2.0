import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Converts a backend numeric rating (1–5) to a UI label string. */
export function numberToRating(num: number): string {
  if (num >= 5) return "EXCELLENT";
  if (num >= 4) return "GOOD";
  if (num >= 3) return "AVERAGE";
  if (num >= 2) return "POOR";
  return "VERY_POOR";
}

/** Converts a numeric rating to a numeric value for bar widths etc. */
export function ratingValue(label: string | null): number {
  if (label === "EXCELLENT") return 5;
  if (label === "GOOD") return 4;
  if (label === "AVERAGE") return 3;
  if (label === "POOR") return 2;
  if (label === "VERY_POOR") return 1;
  return 0;
}

/** Labels for numeric rating values 1–5. */
export const ratingLabels: Record<number, string> = {
  5: "EXCELLENT",
  4: "GOOD",
  3: "AVERAGE",
  2: "POOR",
  1: "VERY_POOR",
};
