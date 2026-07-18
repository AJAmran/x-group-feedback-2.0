"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, Settings2 } from "lucide-react";

const TABS = [
  { key: "performance", label: "Performance", icon: BarChart3 },
  { key: "management", label: "Management", icon: Settings2 },
] as const;

export function BranchTabsSwitcher({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const switchTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("page");
    params.delete("search");
    router.push(`/dashboard/branches?${params.toString()}`);
  };

  return (
    <div className="flex items-center p-1 gap-1 glass-card rounded-2xl shrink-0">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => switchTab(key)}
            id={`branch-tab-${key}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-label font-semibold transition-all duration-200 ${
              isActive
                ? "bg-ios-primary text-ios-on-primary shadow-md"
                : "text-ios-foreground-subtle hover:text-ios-foreground hover:bg-ios-border-subtle"
            }`}
          >
            <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
