import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { CARD_ACCENTS, type CardAccent } from "@/components/dashboard/card-accent";

interface QuickLinkCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  href: string;
  accent?: CardAccent;
}

export function QuickLinkCard({ title, value, subtext, icon: Icon, href, accent = "navy" }: QuickLinkCardProps) {
  const a = CARD_ACCENTS[accent];

  return (
    <Link href={href} className="group block h-full">
      <div className="h-full rounded-2xl border border-ios-border-subtle bg-surface-300 shadow-sm p-5 transition-all duration-200 hover:border-ios-primary/25 hover:shadow-md flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-[1.04] ${a.tile}`}
          >
            <Icon size={18} strokeWidth={2.25} />
          </div>
          <span className="w-7 h-7 rounded-lg border border-ios-border-subtle bg-surface-200 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-ios-primary group-hover:border-ios-primary group-hover:text-ios-on-primary">
            <ArrowUpRight size={14} strokeWidth={2.25} />
          </span>
        </div>

        <p className="mt-4 text-caption font-semibold uppercase tracking-[0.12em] text-ios-foreground-subtle leading-none">
          {title}
        </p>
        <p className="mt-2 text-title font-extrabold tracking-tight text-ios-foreground leading-none tabular-nums">
          {value}
        </p>

        {subtext && (
          <p className="text-micro text-ios-foreground-faint font-medium mt-2.5">{subtext}</p>
        )}
      </div>
    </Link>
  );
}