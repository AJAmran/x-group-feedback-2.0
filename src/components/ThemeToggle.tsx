"use client";

import React, { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

type Theme = "light" | "dark";

const THEME_CHANGE_EVENT = "themechange";

const getThemeSnapshot = (): Theme | null => {
  if (typeof document === "undefined") return null;
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

const subscribeToTheme = (onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
};

interface ThemeToggleProps {
  className?: string;
}

/**
 * Placement-agnostic — no `fixed` positioning. The parent (header bar)
 * controls where this sits, which is what prevents overlap on mobile.
 */
export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => null);

  const toggleTheme = () => {
    if (!theme) return;
    const nextTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.classList.toggle("light", nextTheme === "light");
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  if (!theme) {
    return <div className={`w-[72px] h-[34px] shrink-0 ${className}`} aria-hidden="true" />;
  }

  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`
        relative flex items-center w-[72px] h-[34px] shrink-0
        liquid-glass rounded-full! px-1 cursor-pointer
        transition-colors duration-300
        ${className}
      `}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
    >
      <div className="flex w-full h-full relative z-10 pointer-events-none">
        <div className="flex-1 flex items-center justify-center">
          <Sun
            size={13}
            strokeWidth={2.25}
            className={`transition-colors duration-300 ${isLight ? "text-ios-on-primary" : "text-ios-foreground-faint"}`}
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Moon
            size={13}
            strokeWidth={2.25}
            className={`transition-colors duration-300 ${!isLight ? "text-ios-on-primary" : "text-ios-foreground-faint"}`}
            aria-hidden="true"
          />
        </div>
      </div>

      <motion.div
        className="absolute top-[3px] left-[3px] bottom-[3px] w-[30px] rounded-full z-20"
        style={{
          background: "linear-gradient(135deg, oklch(var(--ios-primary)), oklch(var(--ios-secondary)))",
          boxShadow: "0 3px 8px -2px rgba(0,0,0,0.3)",
        }}
        animate={{ x: isLight ? 0 : 34 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
      />
    </button>
  );
}