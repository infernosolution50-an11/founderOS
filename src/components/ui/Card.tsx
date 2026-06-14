import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "surface" | "interactive" | "elevated";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const variants: Record<CardVariant, string> = {
  surface: "rounded-os-sm border border-os-border bg-os-panel p-3.5",
  interactive:
    "motion-safe-transition cursor-pointer rounded-os-sm border border-os-border bg-os-panel p-3.5 hover:border-os-border-strong hover:bg-os-surface active:scale-[0.99]",
  elevated: "rounded-os-md border border-os-border-strong bg-os-surface p-4"
};

export function Card({ className, variant = "surface", ...props }: CardProps) {
  return <div className={cn(variants[variant], className)} {...props} />;
}
