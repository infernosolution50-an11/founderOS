import { Card } from "@/components/ui/Card";
import { FieldLabel } from "@/components/ui/Tooltip";
import type { ReactNode } from "react";

type SliderProps = {
  label: string;
  tooltip?: ReactNode;
  value: number;
  min?: number;
  max?: number;
  suffix?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
};

export function Slider({ label, tooltip, value, min = 1, max = 10, suffix = "", disabled, onChange }: SliderProps) {
  return (
    <Card>
      <label className="block">
        <div className="flex items-center justify-between gap-4">
          <FieldLabel label={label} tooltip={tooltip} className="font-display text-os-sm font-semibold text-os-text" />
          <span className="min-w-12 rounded-full bg-os-surface px-3 py-1 text-center font-display text-os-sm text-os-sub">
            {value}
            {suffix}
          </span>
        </div>
        <input
          className="mt-4 h-4 w-full cursor-pointer accent-os-indigo disabled:cursor-not-allowed disabled:opacity-50"
          type="range"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>
    </Card>
  );
}
