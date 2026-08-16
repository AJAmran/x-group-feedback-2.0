"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Building2, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Branch {
  code: string;
  name: string;
}

interface BranchSelectProps {
  branches: Branch[];
  value: string;
  onSelect: (code: string) => void;
  placeholder?: string;
  /** Optional trigger width (e.g. "min-w-[180px]"). Defaults to a comfortable width. */
  className?: string;
  triggerClassName?: string;
}

/**
 * Branch picker for dashboard filters. Renders the selected branch's full name
 * on the trigger and opens a portalled menu so long names are never clipped.
 */
export function BranchSelect({
  branches,
  value,
  onSelect,
  placeholder = "All Branches",
  className,
  triggerClassName,
}: BranchSelectProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const isInside = triggerRef.current?.contains(target) ?? false;
      const isInsideMenu = menuRef.current?.contains(target) ?? false;
      if (!isInside && !isInsideMenu) {
        setOpen(false);
      }
    }
    function handleReposition() {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
      }
    }
    handleReposition();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

  const selected = branches.find((b) => b.code === value);

  function handleSelect(code: string) {
    onSelect(code);
    setOpen(false);
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={cn("relative flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-xl bg-ios-border-subtle/40 border border-ios-border-subtle", className)}
      >
        <Building2 size={14} className="text-ios-primary shrink-0" />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            "flex items-center gap-2 h-9 rounded-lg px-2 min-w-[160px] max-w-[280px] text-caption font-medium text-ios-foreground bg-transparent border-0 shadow-none cursor-pointer hover:bg-ios-border-subtle transition-colors duration-150 text-left",
            triggerClassName,
          )}
        >
          <span className="truncate flex-1">{selected ? selected.name : placeholder}</span>
          <ChevronDown
            size={14}
            className={cn("shrink-0 text-ios-foreground-faint transition-transform duration-200", open && "rotate-180")}
          />
        </button>
      </div>

      {open && pos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label="Select branch"
            className="fixed z-[100] glass-card p-1.5 rounded-2xl border border-ios-border shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
            style={{ top: pos.top, left: pos.left, width: Math.max(pos.width, 240) }}
          >
            <ul className="space-y-0.5 max-h-64 overflow-y-auto">
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={!value}
                  onClick={() => handleSelect("")}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-label transition-colors duration-150",
                    !value
                      ? "bg-ios-primary/10 text-ios-primary font-semibold"
                      : "text-ios-foreground font-medium hover:bg-ios-border-subtle",
                  )}
                >
                  <Building2 size={14} className="shrink-0" />
                  <span className="min-w-0 flex-1">{placeholder}</span>
                  {!value && <Check size={14} className="shrink-0 text-ios-primary" />}
                </button>
              </li>
              {branches.map((b) => (
                <li key={b.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={b.code === value}
                    onClick={() => handleSelect(b.code)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors duration-150",
                      b.code === value
                        ? "bg-ios-primary/10 text-ios-primary font-semibold"
                        : "text-ios-foreground font-medium hover:bg-ios-border-subtle",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-label block truncate">{b.name}</span>
                      <span className="text-micro text-ios-foreground-faint">{b.code}</span>
                    </div>
                    {b.code === value && <Check size={14} className="shrink-0 text-ios-primary" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
