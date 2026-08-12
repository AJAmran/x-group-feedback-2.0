"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";
import { getBreadcrumbSegments } from "@/lib/dashboard-routes";
import { Avatar } from "@/components/dashboard/avatar";
import { RoleBadge } from "@/components/dashboard/role-badge";
import { getRoleLabel } from "@/lib/roles";
import type { UserRole } from "@/types";

interface TopnavProps {
  onMenuClick: () => void;
  collapsed: boolean;
  userName: string;
  role: UserRole;
}

export function Topnav({ onMenuClick, collapsed, userName, role }: TopnavProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const breadcrumbs = getBreadcrumbSegments(pathname);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 flex items-center justify-between h-14 px-4 lg:px-6 border-b border-ios-border-subtle bg-surface-200/90 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? "lg:ml-[4.25rem]" : "lg:ml-60"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="icon" onClick={onMenuClick} aria-label="Open navigation menu" icon={Menu} className="lg:hidden shrink-0" />

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-label min-w-0 overflow-hidden">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <ChevronRight size={13} className="text-ios-foreground-faint shrink-0" />}
              {crumb.href && i < breadcrumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className="text-ios-foreground-subtle font-medium hover:text-ios-primary transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={`truncate ${
                    i === breadcrumbs.length - 1
                      ? "text-ios-foreground font-semibold"
                      : "text-ios-foreground-subtle font-medium"
                  }`}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-ios-border-subtle/80 transition-colors"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <Avatar name={userName} size="sm" />
            <span className="text-label font-semibold text-ios-foreground hidden sm:block max-w-[120px] truncate">
              {userName}
            </span>
            <ChevronDown
              size={14}
              className={`text-ios-foreground-subtle hidden sm:block transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 glass-card-plain rounded-xl p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-2.5 border-b border-ios-border-subtle mb-1">
                <p className="text-label font-semibold text-ios-foreground truncate">{userName}</p>
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <RoleBadge role={role} />
                  <p className="text-micro text-ios-foreground-faint">{getRoleLabel(role)}</p>
                </div>
              </div>
              <form action={logoutAction}>
                <Button variant="ghost-red" type="submit" icon={LogOut} className="w-full justify-start">
                  Sign Out
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
