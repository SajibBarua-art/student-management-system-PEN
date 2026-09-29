"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      aria-label="Toggle visual theme"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 cursor-pointer select-none border ${
        isDark
          ? "bg-slate-900/90 text-amber-400 border-white/10 hover:bg-slate-800 hover:border-amber-400/30 shadow-xs"
          : "bg-white text-indigo-600 border-slate-200 hover:bg-slate-100 hover:border-indigo-300 shadow-sm"
      } ${className || ""}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transform rotate-0 scale-100 transition-all duration-300 text-amber-400 animate-in spin-in-180" />
        ) : (
          <Moon className="w-4 h-4 transform rotate-0 scale-100 transition-all duration-300 text-indigo-600 animate-in spin-in-180" />
        )}
      </div>
    </button>
  );
}
