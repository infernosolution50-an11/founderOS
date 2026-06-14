import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type PillSelectorProps = {
  label?: string;
  options: string[];
  value: string | string[];
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
};

export function PillSelector({ label, options, value, multiple, onChange }: PillSelectorProps) {
  function toggle(option: string) {
    if (!multiple) {
      onChange(option);
      return;
    }

    const current = Array.isArray(value) ? value : [];
    onChange(current.includes(option) ? current.filter((item) => item !== option) : [...current, option]);
  }

  return (
    <Card>
      {label && <div className="mb-3 font-display text-os-sm font-semibold text-os-text">{label}</div>}
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
