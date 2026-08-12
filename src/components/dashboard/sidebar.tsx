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
  ChevronLeft,
  PanelRightClose,
  X,
} from "lucide-react";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/Button";
import { MANAGEMENT_ROLES } from "@/lib/roles";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  roles?: UserRole[];
  section?: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/branches", label: "Branches", icon: Building2, roles: MANAGEMENT_ROLES },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: MANAGEMENT_ROLES },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["SUPER_ADMIN"] },
  { href: "/dashboard/manager-report", label: "Manager Reports", icon: ClipboardList, section: "Daily Operations" },
  { href: "/dashboard/guest-offers", label: "Guest Offers", icon: BadgePercent, section: "Daily Operations" },
  { href: "/dashboard/inventory", label: "Inventory", icon: PackageCheck, section: "Daily Operations" },
];

function getNavItems(role: UserRole): NavItem[] {
  return ALL_NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });
}

function isNavActive(pathname: string, href: string): boolean {
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
    <div className="relative w-8 h-8 rounded-lg bg-linear-to-br from-ios-primary to-ios-accent flex items-center justify-center shadow-sm">
      <span className="text-micro font-extrabold text-ios-on-primary tracking-tight">XG</span>
      <span className="absolute -inset-px rounded-lg border border-ios-accent/40 pointer-events-none" aria-hidden="true" />
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
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-label font-semibold transition-all duration-200 group
        ${
          isActive
            ? "bg-ios-primary/10 text-ios-primary shadow-sm"
            : "text-ios-foreground-subtle hover:text-ios-foreground hover:bg-ios-border-subtle/80"
        }`}
      title={collapsed ? item.label : undefined}
    >
      {isActive && <span className="nav-active-indicator" aria-hidden="true" />}
      <item.icon
        size={20}
        strokeWidth={isActive ? 2.5 : 2}
        className={`shrink-0 transition-colors ${isActive ? "text-ios-primary" : "group-hover:text-ios-foreground"}`}
      />
      {!collapsed && (
        <span className="truncate flex items-center gap-1.5">
          {item.label}
          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-ios-accent" aria-hidden="true" />}
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) {
    return <div className="mx-3 my-2 h-px bg-ios-border-subtle" />;
  }
  return (
    <div className="flex items-center gap-2 px-3 pt-5 pb-2">
      <span className="w-1.5 h-1.5 rounded-full bg-ios-accent/70" aria-hidden="true" />
      <p className="text-micro font-bold uppercase tracking-[0.18em] text-ios-foreground-faint">
        {label}
      </p>
      <div className="flex-1 h-px bg-ios-border-subtle" />
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
        const isActive = isNavActive(pathname, item.href);
        const prevSection = index > 0 ? navItems[index - 1].section : undefined;
        const showHeader = item.section && item.section !== prevSection;
        return (
          <div key={item.href}>
            {showHeader && <SectionLabel label={item.section!} collapsed={collapsed} />}
            <NavLink
              item={item}
              isActive={isActive}
              collapsed={collapsed}
              onClick={onMobileClose}
            />
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-ios-border-subtle">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <BrandMark />
            <div>
              <p className="text-label font-extrabold text-ios-foreground leading-none tracking-tight font-display">
                Insights
              </p>
              <p className="text-micro text-ios-foreground-faint mt-0.5 tracking-wide">
                X-Group Hospitality
              </p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto" aria-label="X-Group Insights home">
            <BrandMark />
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-ios-border-subtle text-ios-foreground-subtle hover:text-ios-foreground transition-colors hidden lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelRightClose size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="gold-rule" aria-hidden="true" />

      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-0.5">
        <NavList navItems={navItems} pathname={pathname} collapsed={collapsed} onMobileClose={onMobileClose} />
      </nav>

      <div className={`px-4 py-4 border-t border-ios-border-subtle ${collapsed ? "text-center" : ""}`}>
        {!collapsed && (
          <p className="text-micro text-ios-foreground-faint font-medium tracking-wide">
            © {new Date().getFullYear()} X-Group
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-surface-200/95 backdrop-blur-xl border-r border-ios-border-subtle z-30 transition-all duration-300 ${
          collapsed ? "w-[4.25rem]" : "w-60"
        }`}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative w-72 h-full bg-surface-300 backdrop-blur-xl border-r border-ios-border-subtle shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-4 h-16 border-b border-ios-border-subtle">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <BrandMark />
                <p className="text-label font-extrabold text-ios-foreground font-display">Insights</p>
              </Link>
              <Button variant="icon" size="sm" onClick={onMobileClose} icon={X} />
            </div>
            <nav className="py-3 px-3 space-y-0.5 overflow-y-auto max-h-[calc(100%-4rem)]">
              <NavList navItems={navItems} pathname={pathname} collapsed={false} onMobileClose={onMobileClose} />
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
