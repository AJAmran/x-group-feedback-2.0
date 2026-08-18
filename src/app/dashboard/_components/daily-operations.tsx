import Link from "next/link";
import { Clock, ClipboardList, PackageCheck, ArrowUpRight } from "lucide-react";
import { getOperationalWidgets } from "@/features/dashboard/actions";
import { cn } from "@/lib/utils";

type Tone = "amber" | "indigo" | "green" | "gold";

interface OperationalCardData {
  title: string;
  value: number;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  subtext: string;
  status?: string;
  statusTone?: "amber" | "green" | "neutral";
  href: string;
  tone: Tone;
}

const TONES: Record<Tone, { iconWrap: string; glow: string; bar: string }> = {
  amber: {
    iconWrap: "bg-xg-warning-soft border-xg-warning/25 text-xg-warning",
    glow: "from-xg-warning/25",
    bar: "from-xg-warning to-[oklch(74%_0.14_80)]",
  },
  indigo: {
    iconWrap: "bg-xg-primary-soft border-xg-primary/25 text-xg-primary",
    glow: "from-xg-primary/25",
    bar: "from-xg-primary to-xg-gold",
  },
  green: {
    iconWrap: "bg-xg-positive-soft border-xg-positive/25 text-xg-positive",
    glow: "from-xg-positive/25",
    bar: "from-xg-positive to-[oklch(62%_0.14_160)]",
  },
  gold: {
    iconWrap: "bg-xg-gold-soft border-xg-gold/30 text-xg-gold",
    glow: "from-xg-gold/30",
    bar: "from-xg-gold to-[oklch(74%_0.14_85)]",
  },
};

function OperationalCard({ title, value, icon: Icon, subtext, status, statusTone = "neutral", href, tone }: OperationalCardData) {
  const t = TONES[tone];
  const statusStyles =
    statusTone === "amber"
      ? "bg-xg-warning-soft border border-xg-warning/25 text-xg-warning"
      : statusTone === "green"
        ? "bg-xg-positive-soft border border-xg-positive/25 text-xg-positive"
        : "bg-surface-200 border border-ios-border-subtle text-ios-foreground-subtle";

  return (
    <Link href={href} className="group block h-full focus-visible:outline-none">
      <div className="relative overflow-hidden glass-card flex flex-col h-full card-lift">
        <span aria-hidden="true" className={cn("absolute top-0 left-0 right-0 h-1 bg-linear-to-r", t.bar)} />
        <div
          aria-hidden="true"
          className={cn("pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-linear-to-br to-transparent blur-2xl opacity-60 transition-opacity group-hover:opacity-90", t.glow)}
        />
        <div className="relative flex items-start justify-between gap-3 px-5 pt-5">
          <div className={cn("icon-tile-lg transition-transform duration-200 group-hover:scale-105", t.iconWrap)}>
            <Icon size={18} strokeWidth={2.2} />
          </div>
          <span className="w-7 h-7 rounded-lg border border-ios-border-subtle bg-surface-200 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-xg-primary group-hover:border-xg-primary group-hover:text-white">
            <ArrowUpRight size={13} strokeWidth={2.4} />
          </span>
        </div>

        <div className="relative px-5 pt-4 pb-5 flex flex-col flex-1">
          <p className="card-heading leading-none">
            {title}
          </p>
          <p className="stat-value mt-2.5">
            {value}
          </p>
          <p className="meta-caption mt-2">{subtext}</p>
          {status && (
            <div className="mt-auto pt-4">
              <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-micro font-bold", statusStyles)}>
                {statusTone === "amber" && (
                  <span className="relative flex w-1.5 h-1.5" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-xg-warning opacity-75 animate-ping" />
                    <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-xg-warning" />
                  </span>
                )}
                {statusTone === "green" && <span className="w-1.5 h-1.5 rounded-full bg-xg-positive" aria-hidden="true" />}
                {statusTone === "neutral" && <span className="w-1.5 h-1.5 rounded-full bg-ios-foreground-faint" aria-hidden="true" />}
                {status}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export async function DailyOperations() {
  const widgets = await getOperationalWidgets();

  const cards: OperationalCardData[] = [
    {
      title: "Pending Approvals",
      value: widgets.pendingApprovals.total,
      icon: Clock,
      subtext: `${widgets.pendingApprovals.discounts} discounts · ${widgets.pendingApprovals.entertainments} entertainment`,
      status: widgets.pendingApprovals.total > 0 ? "Needs Approval" : "All Reviewed",
      statusTone: widgets.pendingApprovals.total > 0 ? "amber" : "green",
      href: "/dashboard/guest-offers",
      tone: "amber",
    },
    {
      title: "Manager Reports Today",
      value: widgets.managerReportsSubmittedToday,
      icon: ClipboardList,
      subtext: "Submitted today",
      href: "/dashboard/manager-report",
      tone: "indigo",
    },
    {
      title: "Inventory This Month",
      value: widgets.inventoryThisMonth.branchesWithStatement,
      icon: PackageCheck,
      subtext: `${widgets.inventoryThisMonth.submitted} submitted · ${widgets.inventoryThisMonth.draft} draft`,
      status: widgets.inventoryThisMonth.submitted > 0 ? `${widgets.inventoryThisMonth.submitted} submitted` : "Awaiting submission",
      statusTone: widgets.inventoryThisMonth.submitted > 0 ? "green" : "neutral",
      href: "/dashboard/inventory",
      tone: "green",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <OperationalCard key={card.title} {...card} />
      ))}
    </div>
  );
}