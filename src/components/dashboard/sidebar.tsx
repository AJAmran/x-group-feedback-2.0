"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Building2,
  FileText,
  Settings,
  ChevronLeft,
  PanelRightClose,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/branches", label: "Branches", icon: Building2 },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-ios-border-subtle">
        {!collapsed && (
          <Link href="/dashboard" className="text-display font-extrabold tracking-tight">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-ios-primary to-ios-accent">
              XG
            </span>
            <span className="text-ios-foreground-muted font-medium text-label ml-1">
              Insights
            </span>
          </Link>
        )}
        <button
          onClick={collapsed ? onToggle : onToggle}
          className="p-1.5 rounded-lg hover:bg-ios-border-subtle text-ios-foreground-subtle hover:text-ios-foreground transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelRightClose size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-label font-semibold transition-all duration-200 group
                ${isActive
                  ? "bg-ios-primary/10 text-ios-primary shadow-sm"
                  : "text-ios-foreground-subtle hover:text-ios-foreground hover:bg-ios-border-subtle"
                }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className="shrink-0"
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`px-3 py-4 border-t border-ios-border-subtle ${collapsed ? "text-center" : ""}`}>
        {!collapsed && (
          <p className="text-micro font-bold uppercase tracking-[0.2em] text-ios-foreground-faint">
            X-Group Hospitality
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-surface-200 backdrop-blur-xl border-r border-ios-border-subtle z-30 transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative w-72 h-full bg-surface-300 backdrop-blur-xl border-r border-ios-border-subtle shadow-2xl animate-in slide-in-from-left">
            <div className="flex items-center justify-between px-4 h-16 border-b border-ios-border-subtle">
              <Link href="/dashboard" className="text-display font-extrabold tracking-tight">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-ios-primary to-ios-accent">
                  XG
                </span>
                <span className="text-ios-foreground-muted font-medium text-label ml-1">
                  Insights
                </span>
              </Link>
              <button
                onClick={onMobileClose}
                className="p-1.5 rounded-lg hover:bg-ios-border-subtle text-ios-foreground-subtle"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="py-4 px-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-label font-semibold transition-all duration-200
                      ${isActive
                        ? "bg-ios-primary/10 text-ios-primary shadow-sm"
                        : "text-ios-foreground-subtle hover:text-ios-foreground hover:bg-ios-border-subtle"
                      }`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
