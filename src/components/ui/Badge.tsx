import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "indigo" | "amber" | "green" | "red";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  neutral: "border-os-border bg-os-panel text-os-sub",
  indigo: "border-os-indigo/50 bg-os-indigo/15 text-os-indigo",
  amber: "border-os-amber/50 bg-os-amber/15 text-os-amber",
  green: "border-os-green/50 bg-os-green/15 text-os-green",
  red: "border-os-red/50 bg-os-red/15 text-os-red"
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 font-display text-os-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
