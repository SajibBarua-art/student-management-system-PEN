import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "success" | "gradient";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer select-none";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-xs sm:text-sm px-4 py-2 gap-2",
      lg: "text-sm sm:text-base px-5 py-2.5 gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/20 focus:ring-indigo-500",
      gradient:
        "bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 border border-white/20 focus:ring-indigo-500",
      secondary:
        "bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-white/[0.08] shadow-sm focus:ring-slate-500",
      outline:
        "border border-white/15 text-slate-200 hover:bg-white/[0.06] hover:border-white/25 focus:ring-indigo-500 bg-white/[0.02]",
      danger:
        "bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 border border-rose-400/20 focus:ring-rose-500",
      ghost:
        "text-slate-400 hover:text-white hover:bg-white/[0.06] focus:ring-slate-500",
      success:
        "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/20 focus:ring-emerald-500",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          clsx(base, sizeStyles[size], variantStyles[variant], className)
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
