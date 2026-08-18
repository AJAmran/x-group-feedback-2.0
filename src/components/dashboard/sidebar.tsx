"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Building2,
  Users,
  FileText,
  Settings,
  ClipboardList,
  BadgePercent,
  PackageCheck,
  FileSpreadsheet,
  ChevronLeft,
  PanelRightClose,
  X,
} from "lucide-react";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/Button";
import { MANAGEMENT_ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  roles?: UserRole[];
  section?: string;
}

// Ordered navigation groups. Group labels (section) render as prefixed headers.
// Routes & role-gating are identical to before — only the visual composition changes.
const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },

  { href: "/dashboard/manager-report", label: "Manager Reports", icon: ClipboardList, section: "Operations" },
  { href: "/dashboard/guest-offers", label: "Guest Offers", icon: BadgePercent, section: "Operations" },
  { href: "/dashboard/inventory", label: "Inventory", icon: PackageCheck, section: "Operations" },
  { href: "/dashboard/inventory/report", label: "Inventory Report", icon: FileSpreadsheet, section: "Operations" },

  { href: "/dashboard/branches", label: "Branches", icon: Building2, roles: MANAGEMENT_ROLES, section: "Administration" },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: MANAGEMENT_ROLES, section: "Administration" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["SUPER_ADMIN"], section: "Administration" },
];

function getNavItems(role: UserRole): NavItem[] {
  return ALL_NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });
}

function isSegmentPrefix(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  role: UserRole;
}

function BrandMark() {
  return (
    <div className="relative w-8 h-8 rounded-xl bg-linear-to-br from-[oklch(72%_0.11_272)] to-[oklch(62%_0.13_85)] flex items-center justify-center shadow-[0_6px_18px_-6px_oklch(36%_0.13_274/0.9)]">
      <span className="text-micro font-extrabold text-white tracking-tight">XG</span>
      <span className="absolute -inset-px rounded-xl border border-white/20 pointer-events-none" aria-hidden="true" />
    </div>
  );
}

function NavLink({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 rounded-xl text-[0.8125rem] font-semibold transition-all duration-200 group",
        collapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5",
        isActive
          ? "bg-xg-sidebar-active text-xg-sidebar-text"
          : "text-xg-sidebar-muted hover:text-xg-sidebar-text hover:bg-xg-sidebar-hover",
      )}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? "page" : undefined}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-linear-to-b from-[oklch(78%_0.11_85)] to-[oklch(72%_0.11_272)] shadow-[0_0_10px_1px_oklch(72%_0.11_272/0.8)]"
        />
      )}
      <Icon
        size={19}
        strokeWidth={isActive ? 2.4 : 2}
        className={cn(
          "shrink-0 transition-colors",
          isActive ? "text-xg-primary-strong" : "text-xg-sidebar-faint group-hover:text-xg-sidebar-text",
        )}
      />
      {!collapsed && (
        <span className="truncate flex items-center gap-1.5">
          {item.label}
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) {
    return <div className="mx-3 my-2 h-px bg-xg-sidebar-border" />;
  }
  return (
    <div className="flex items-center gap-2 px-3 pt-5 pb-1.5">
      <p className="text-[0.625rem] font-bold uppercase tracking-[0.22em] text-xg-sidebar-faint/60">
        {label}
      </p>
      <div className="flex-1 h-px bg-xg-sidebar-border" />
    </div>
  );
}

function NavList({
  navItems,
  pathname,
  collapsed,
  onMobileClose,
}: {
  navItems: NavItem[];
  pathname: string;
  collapsed: boolean;
  onMobileClose?: () => void;
}) {
  return (
    <>
      {navItems.map((item, index) => {
        const activeHref = navItems
          .map((i) => i.href)
          .filter((href) => isSegmentPrefix(href, pathname))
          .sort((a, b) => b.length - a.length)[0];
        const isActive = item.href === activeHref;
        const prevSection = index > 0 ? navItems[index - 1].section : undefined;
        const showHeader = item.section && item.section !== prevSection;
        return (
          <div key={item.href}>
            {showHeader && <SectionLabel label={item.section!} collapsed={collapsed} />}
            <NavLink item={item} isActive={isActive} collapsed={collapsed} onClick={onMobileClose} />
          </div>
        );
      })}
    </>
  );
}


export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose, role }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  const sidebarContent = (
    <div className="flex flex-col h-full text-xg-sidebar-text">
      <div className={cn("flex items-center shrink-0 border-b border-xg-sidebar-border h-16", collapsed ? "px-4 justify-center" : "px-4 justify-between")}>
        {collapsed ? (
          <Link href="/dashboard" className="mx-auto" aria-label="X-Group Insights home">
            <BrandMark />
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <BrandMark />
            <div>
              <p className="text-[0.9375rem] font-extrabold text-xg-sidebar-text leading-none tracking-tight">
                X-Group
              </p>
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.28em] text-xg-sidebar-faint mt-1">
                Hospitality
              </p>
            </div>
          </Link>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-xg-sidebar-hover text-xg-sidebar-faint hover:text-xg-sidebar-text transition-colors hidden lg:flex"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      <nav className="sidebar-scroll flex-1 py-3 px-3 overflow-y-auto overflow-x-hidden">
        <NavList navItems={navItems} pathname={pathname} collapsed={collapsed} onMobileClose={onMobileClose} />
      </nav>

      <div className="shrink-0">
        <div className={cn("border-t border-xg-sidebar-border py-3", collapsed ? "px-4" : "px-4 flex items-center justify-between")}>
          {!collapsed && (
            <p className="text-[0.625rem] text-xg-sidebar-faint/60 font-medium tracking-wide">
              © {new Date().getFullYear()} X-Group
            </p>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-xg-sidebar-hover text-xg-sidebar-faint hover:text-xg-sidebar-text transition-colors hidden lg:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelRightClose size={18} /> : <PanelRightClose size={18} className="rotate-180" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-full z-30 transition-all duration-300",
          "bg-linear-to-b from-xg-sidebar-2 to-xg-sidebar",
          "border-r border-xg-sidebar-border shadow-[10px_0_30px_-20px_rgba(0,0,0,0.6)]",
          collapsed ? "w-[4.25rem]" : "w-60",
        )}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-72 h-full bg-linear-to-b from-xg-sidebar-2 to-xg-sidebar border-r border-xg-sidebar-border shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-4 h-16 border-b border-xg-sidebar-border">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <BrandMark />
                <div>
                  <p className="text-[0.9375rem] font-extrabold text-xg-sidebar-text leading-none">X-Group</p>
                  <p className="text-[0.625rem] font-semibold uppercase tracking-[0.28em] text-xg-sidebar-faint mt-1">Hospitality</p>
                </div>
              </Link>
              <Button variant="icon" size="sm" onClick={onMobileClose} icon={X} className="text-xg-sidebar-faint hover:text-xg-sidebar-text hover:bg-xg-sidebar-hover" />
            </div>
            <nav className="sidebar-scroll py-3 px-3 overflow-y-auto max-h-[calc(100%-4rem)]">
              <NavList navItems={navItems} pathname={pathname} collapsed={false} onMobileClose={onMobileClose} />
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}