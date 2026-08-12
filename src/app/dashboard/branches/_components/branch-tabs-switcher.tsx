"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { LucideIcon } from "lucide-react";

const TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "performance", label: "Performance", icon: BarChart3 },
  { key: "management", label: "Management", icon: Settings2 },
];

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
      {TABS.map(({ key, label, icon }) => {
        const isActive = activeTab === key;
        return (
          <Button
            key={key}
            variant={isActive ? "primary" : "outline"}
            size="sm"
            icon={icon}
            onClick={() => switchTab(key)}
            id={`branch-tab-${key}`}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}
