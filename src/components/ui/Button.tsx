"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-os-indigo bg-os-indigo text-white hover:bg-os-indigo/90 focus-visible:border-os-indigo active:scale-[0.97]",
  secondary:
    "border-os-border bg-transparent text-os-text hover:border-os-border-strong hover:bg-os-panel active:scale-[0.97]",
  ghost:
    "border-transparent bg-transparent text-os-sub hover:bg-os-panel hover:text-os-text active:scale-[0.97]",
  destructive:
    "border-os-border bg-transparent text-os-sub hover:border-os-red hover:bg-os-red/10 hover:text-os-red active:scale-[0.97]"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 min-h-9 px-3 text-os-xs",
  md: "h-9 min-h-11 px-4 text-os-sm md:min-h-9",
  lg: "h-12 min-h-12 px-5 text-sm md:h-10 md:min-h-10",
  icon: "h-11 min-h-11 w-11 min-w-11 p-0 md:h-10 md:min-h-10 md:w-10 md:min-w-10"
};

export function Button({
  className,
  children,
  variant = "secondary",
  size = "md",
  loading,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "motion-safe-transition inline-flex items-center justify-center gap-2 rounded-os-md border font-medium disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : leftIcon}
      {size !== "icon" && <span>{loading ? "Working..." : children}</span>}
      {!loading && rightIcon}
    </button>
  );
}
