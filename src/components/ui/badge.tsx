import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "info" | "outline" | "purple";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/90 dark:text-slate-200 dark:border-slate-700/80 shadow-xs",
    secondary: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-white/[0.08]",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 shadow-xs",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30 shadow-xs",
    danger: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30 shadow-xs",
    info: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30 shadow-xs",
    purple: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30 shadow-xs",
    outline: "border border-slate-300 text-slate-700 dark:border-white/20 dark:text-slate-300 bg-transparent",
  };

  const dotColors = {
    default: "bg-slate-400",
    secondary: "bg-slate-400",
    success: "bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    warning: "bg-amber-500 dark:bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    danger: "bg-rose-500 dark:bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]",
    info: "bg-sky-500 dark:bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]",
    purple: "bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]",
    outline: "bg-slate-400 dark:bg-slate-300",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-xs transition-all",
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}
