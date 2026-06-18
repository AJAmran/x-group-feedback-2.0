import { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function clsx(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter(Boolean)
    .map((x) => {
      if (typeof x === "string") return x;
      if (typeof x === "object" && x !== null) {
        return Object.entries(x)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k)
          .join(" ");
      }
      return "";
    })
    .join(" ");
}
