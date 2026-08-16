"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface UserActionMenuProps {
  user: User;
  toggling: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

const MENU_WIDTH = 192;

/**
 * Compact per-row action menu for manageable users. Rendered through a portal
 * so it is never clipped by the table card's overflow container, and closes on
 * outside click or Escape. Destructive actions are visually separated.
 */
export function UserActionMenu({ user, toggling, onEdit, onToggleStatus, onDelete }: UserActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target) ?? false;
      const insideMenu = menuRef.current?.contains(target) ?? false;
      if (!insideTrigger && !insideMenu) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
      setPos({ top: rect.bottom + 6, left });
    }
    setOpen(true);
  };

  const itemClass =
    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-caption font-medium transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed";
  const defaultItemClass = cn(itemClass, "text-ios-foreground hover:bg-ios-border-subtle");
  const toggleItemClass = (active: boolean) =>
    cn(
      itemClass,
      active
        ? "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
        : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10",
    );

  return (
    <div className="relative" ref={triggerRef}>
      <button
        type="button"
        onClick={toggleMenu}
        aria-label={`Actions for ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-ios-foreground-subtle hover:bg-ios-border-subtle hover:text-ios-foreground transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && pos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={`Actions for ${user.name}`}
            className="fixed z-[100] glass-card rounded-xl border border-ios-border shadow-xl p-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
            style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
          >
            <button type="button" role="menuitem" className={defaultItemClass} onClick={() => { setOpen(false); onEdit(); }}>
              <Pencil size={13} className="shrink-0" />
              Edit user
            </button>
            <button
              type="button"
              role="menuitem"
              className={toggleItemClass(user.isActive)}
              disabled={toggling}
              onClick={() => { setOpen(false); onToggleStatus(); }}
            >
              {user.isActive ? (
                <ToggleLeft size={13} className="shrink-0" />
              ) : (
                <ToggleRight size={13} className="shrink-0" />
              )}
              {user.isActive ? "Deactivate" : "Activate"}
            </button>
            <div className="h-px bg-ios-border-subtle my-1" role="separator" />
            <button
              type="button"
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-caption font-medium text-[oklch(var(--lacquer))] hover:bg-[oklch(var(--lacquer)/0.1)] transition-colors text-left"
              onClick={() => { setOpen(false); onDelete(); }}
            >
              <Trash2 size={13} className="shrink-0" />
              Delete user
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
