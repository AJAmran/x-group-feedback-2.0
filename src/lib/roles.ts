import type { LucideIcon } from "lucide-react";
import { ShieldCheck, Shield, UserCog } from "lucide-react";
import type { UserRole } from "@/types";

/**
 * Centralized role metadata & access helpers for the admin dashboard.
 * Single source of truth for role labels, icons, colors and route guards.
 */

export const ROLE_ORDER: UserRole[] = ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"];

export interface RoleMeta {
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind classes for the role badge (uses design-system friendly colors). */
  badge: string;
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    shortLabel: "Super Admin",
    description: "Full system access including settings",
    icon: ShieldCheck,
    badge: "bg-purple-600 text-white border-purple-500/30 shadow-sm",
  },
  ADMIN: {
    label: "Admin",
    shortLabel: "Admin",
    description: "Manage branches, users and approvals",
    icon: Shield,
    badge: "bg-sky-600 text-white border-sky-500/30 shadow-sm",
  },
  BRANCH_MANAGER: {
    label: "Branch Manager",
    shortLabel: "Branch Mgr",
    description: "Daily operations for a single branch",
    icon: UserCog,
    badge: "bg-emerald-600 text-white border-emerald-500/30 shadow-sm",
  },
};

export function getRoleMeta(role: UserRole): RoleMeta {
  return ROLE_META[role] ?? ROLE_META.ADMIN;
}

export function getRoleLabel(role: UserRole): string {
  return getRoleMeta(role).label;
}

export function isAdminRole(role: UserRole | undefined | null): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function isBranchManager(role: UserRole | undefined | null): boolean {
  return role === "BRANCH_MANAGER";
}

/** Roles allowed to manage branches / users (anything beyond daily operations). */
export const MANAGEMENT_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN"];

export const BRANCH_MANAGER_SCOPED_ROUTES = [
  "/dashboard",
  "/dashboard/feedback",
  "/dashboard/analytics",
  "/dashboard/reports",
  "/dashboard/manager-report",
  "/dashboard/guest-offers",
  "/dashboard/inventory",
];

/**
 * Whether a role may access a given dashboard path.
 * Page-level redirects (server side) remain the source of truth; this helper
 * is used for shared UI decisions (nav visibility, action buttons).
 */
export function canAccessRoute(role: UserRole | undefined | null, pathname: string): boolean {
  if (!role) return false;
  if (role === "SUPER_ADMIN") return true;
  if (pathname === "/dashboard/settings") return false;
  if (pathname.startsWith("/dashboard/branches") || pathname.startsWith("/dashboard/users")) {
    return role === "ADMIN";
  }
  if (role === "BRANCH_MANAGER") {
    return BRANCH_MANAGER_SCOPED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
  }
  return true;
}
