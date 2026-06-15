import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel } from "@/components/ui/Tooltip";

type PillSelectorProps = {
  label?: string;
  tooltip?: ReactNode;
  options: string[];
  value: string | string[];
  multiple?: boolean;
  disabled?: boolean;
  onChange: (value: string | string[]) => void;
};

export function PillSelector({ label, tooltip, options, value, multiple, disabled, onChange }: PillSelectorProps) {
  function toggle(option: string) {
    if (disabled) return;
    if (!multiple) {
      onChange(option);
      return;
    }

    const current = Array.isArray(value) ? value : [];
    onChange(current.includes(option) ? current.filter((item) => item !== option) : [...current, option]);
  }

  return (
    <Card>
      {label && <FieldLabel label={label} tooltip={tooltip} className="mb-3 font-display text-os-sm font-semibold text-os-text" />}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = Array.isArray(value) ? value.includes(option) : value === option;
          return (
            <Button
              type="button"
              key={option}
              onClick={() => toggle(option)}
              variant="secondary"
              size="md"
              disabled={disabled}
              className={cn(
                "rounded-full",
                active ? "border-os-indigo bg-os-indigo/20 text-os-text" : "text-os-sub"
              )}
            >
              {option}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
