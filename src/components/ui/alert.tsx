import React from "react";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "danger" | "success";
  title?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
  ...props
}: AlertProps) {
  const configs = {
    info: {
      bg: "bg-sky-500/[0.08] border-sky-500/25 text-sky-200",
      accent: "bg-sky-500",
      icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
    },
    warning: {
      bg: "bg-amber-500/[0.08] border-amber-500/25 text-amber-200",
      accent: "bg-amber-500",
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    danger: {
      bg: "bg-rose-500/[0.08] border-rose-500/25 text-rose-200",
      accent: "bg-rose-500",
      icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    },
    success: {
      bg: "bg-emerald-500/[0.08] border-emerald-500/25 text-emerald-200",
      accent: "bg-emerald-500",
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
  };

  const current = configs[variant];

  return (
    <div
      className={twMerge(
        clsx(
          "relative overflow-hidden flex gap-3.5 p-4 sm:p-5 rounded-2xl border backdrop-blur-md text-sm shadow-lg",
          current.bg,
          className
        )
      )}
      {...props}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${current.accent}`} />
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1">
        {title && <h5 className="font-bold text-white text-sm tracking-tight mb-1">{title}</h5>}
        <div className="text-xs sm:text-sm leading-relaxed text-slate-300">{children}</div>
      </div>
    </div>
  );
}
