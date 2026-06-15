import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { FieldLabel } from "@/components/ui/Tooltip";

type DotRatingProps = {
  label: string;
  tooltip?: ReactNode;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

export function DotRating({ label, tooltip, value, disabled, onChange }: DotRatingProps) {
  return (
    <Card>
      <FieldLabel label={label} tooltip={tooltip} className="mb-3 font-display text-os-sm font-semibold text-os-text" />
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((dot) => (
          <button
            key={dot}
            type="button"
            onClick={() => !disabled && onChange(dot)}
            disabled={disabled}
            className={cn(
              "motion-safe-transition flex h-11 min-h-11 w-11 min-w-11 items-center justify-center rounded-full border active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 md:h-9 md:min-h-9 md:w-9 md:min-w-9",
              dot <= value ? "border-os-indigo bg-os-indigo/20" : "border-os-border bg-os-surface"
            )}
            aria-label={`${label} ${dot}`}
          >
            <span className={cn("h-3.5 w-3.5 rounded-full", dot <= value ? "bg-os-indigo" : "bg-os-border")} />
          </button>
        ))}
      </div>
    </Card>
  );
}
