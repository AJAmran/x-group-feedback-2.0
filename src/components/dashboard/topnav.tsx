"use client";

import { usePathname } from "next/navigation";
import { Menu, LogOut, User, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Executive Overview",
  "/dashboard/feedback": "Feedback Management",
  "/dashboard/analytics": "Analytics",
  "/dashboard/branches": "Branch Performance",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
  "/dashboard/users": "User Management",
};

interface TopnavProps {
  onMenuClick: () => void;
  collapsed: boolean;
  userName: string;
}

export function Topnav({ onMenuClick, collapsed, userName }: TopnavProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLabel = ROUTE_LABELS[pathname] || "Dashboard";

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
      className={`sticky top-0 z-20 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-ios-border-subtle bg-surface-200/80 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? "lg:ml-16" : "lg:ml-60"
      }`}
    >
      <div className="flex items-center gap-4">
        <Button variant="icon" onClick={onMenuClick} aria-label="Toggle sidebar" icon={Menu} className="lg:hidden" />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-label">
          <span className="text-ios-foreground-subtle font-medium">Dashboard</span>
          <span className="text-ios-foreground-faint">/</span>
          <span className="text-ios-foreground font-semibold">{currentLabel}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-ios-border-subtle transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-ios-primary/10 flex items-center justify-center">
              <User size={16} className="text-ios-primary" />
            </div>
            <ChevronDown size={14} className="text-ios-foreground-subtle hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 glass-card rounded-xl p-1.5 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-ios-border-subtle mb-1">
                <p className="text-label font-semibold text-ios-foreground truncate">{userName}</p>
              </div>
              <form action={logoutAction}>
                <Button variant="ghost-red" type="submit" icon={LogOut} className="w-full justify-start">Sign Out</Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
