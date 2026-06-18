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

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => null
  );

  const toggleTheme = () => {
    if (!theme) return;

    const nextTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }

    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  if (!theme) return null;

  const isLight = theme === "light";

  return (
    <div
      className="fixed z-50 right-4 sm:right-8"
      style={{ top: "calc(var(--safe-top) + 0.75rem)" }}
    >
      <button
        onClick={toggleTheme}
        className={`
          relative w-[76px] h-[42px] p-1
          liquid-glass rounded-full
          overflow-hidden cursor-pointer
          transition-all duration-300
          ${isLight ? "shadow-[0_10px_24px_-16px_rgba(0,0,0,0.2)]" : "shadow-[0_10px_28px_-16px_rgba(0,0,0,0.32)]"}
        `}
        aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      >
        <div className="flex w-full h-full relative z-10 pointer-events-none">
          <div className="flex-1 flex items-center justify-center">
            <Sun
              size={14}
              className={`transition-colors duration-300 ${isLight ? "text-ios-primary" : "text-ios-foreground-faint"}`}
              strokeWidth={3}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Moon
              size={14}
              className={`transition-colors duration-300 ${isLight ? "text-ios-foreground-faint" : "text-ios-foreground"}`}
              strokeWidth={3}
              aria-hidden="true"
            />
          </div>
        </div>

        <motion.div
          className={`
            absolute top-1 left-1 bottom-1 w-[32px]
            ${isLight ? "bg-white" : "bg-ios-primary"}
            rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)]
            flex items-center justify-center
            z-20
          `}
          animate={{
            x: isLight ? 0 : 36,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 1,
          }}
        >
          <div className="flex items-center justify-center w-full h-full">
            {isLight ? (
              <Sun
                size={16}
                strokeWidth={2.5}
                className="text-ios-primary"
                aria-hidden="true"
              />
            ) : (
              <Moon
                size={16}
                strokeWidth={2.5}
                className="text-ios-on-primary"
                aria-hidden="true"
              />
            )}
          </div>
        </motion.div>
      </button>
    </div>
  );
}
