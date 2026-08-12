"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topnav } from "@/components/dashboard/topnav";
import { DashboardProvider } from "./dashboard-context";
import type { UserRole } from "@/types";

export function DashboardLayoutClient({
  children,
  role,
  userName,
  branchId,
}: {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
  branchId: number | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DashboardProvider value={{ role, userName, branchId }}>
      <div className="min-h-screen bg-ios-background relative">
        <div className="dashboard-bg" aria-hidden="true" />

        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          role={role}
        />

        <Topnav
          onMenuClick={() => setMobileOpen(true)}
          collapsed={collapsed}
          userName={userName}
          role={role}
        />

        <main
          className={`pt-6 px-4 sm:px-6 lg:px-8 pb-10 transition-all duration-300 animate-in fade-in duration-300 ${
            collapsed ? "lg:ml-[4.25rem]" : "lg:ml-60"
          }`}
        >
          <div className="dashboard-page">{children}</div>
        </main>
      </div>
    </DashboardProvider>
  );
}
