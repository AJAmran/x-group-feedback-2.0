"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topnav } from "@/components/dashboard/topnav";
import type { UserRole } from "@/types";

export function DashboardLayoutClient({
  children,
  role,
  userName,
}: {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ios-background">
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
      />

      <main
        className={`pt-4 px-4 sm:px-6 lg:px-8 pb-8 transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-60"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
