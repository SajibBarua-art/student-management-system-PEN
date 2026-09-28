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
    default: "bg-slate-800/90 text-slate-200 border-slate-700/80 shadow-xs",
    secondary: "bg-slate-800/50 text-slate-300 border-white/[0.08]",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-xs shadow-emerald-950/40",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-xs shadow-amber-950/40",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-xs shadow-rose-950/40",
    info: "bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-xs shadow-sky-950/40",
    purple: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-xs shadow-indigo-950/40",
    outline: "border border-white/20 text-slate-300 bg-transparent",
  };

  const dotColors = {
    default: "bg-slate-400",
    secondary: "bg-slate-400",
    success: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    warning: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    danger: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]",
    info: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]",
    purple: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]",
    outline: "bg-slate-300",
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
