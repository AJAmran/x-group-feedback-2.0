"use client";

import { createContext, useContext } from "react";
import type { UserRole } from "@/types";

export interface DashboardUser {
  role: UserRole;
  userName: string;
  branchId: number | null;
}

const DashboardContext = createContext<DashboardUser | null>(null);

export function DashboardProvider({ children, value }: { children: React.ReactNode; value: DashboardUser }) {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardUser(): DashboardUser {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardUser must be used within DashboardProvider");
  return ctx;
}
