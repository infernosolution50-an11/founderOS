import { cn } from "@/lib/utils";

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
    <div className="rounded-2xl border border-os-border bg-os-surface p-4">
      {label && <div className="mb-3 font-display text-sm font-semibold text-os-text">{label}</div>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = Array.isArray(value) ? value.includes(option) : value === option;
          return (
            <button
              type="button"
              key={option}
              onClick={() => toggle(option)}
              className={cn(
                "rounded-full border px-3 py-2 text-sm transition",
                active ? "border-os-indigo bg-os-indigo/20 text-os-text" : "border-os-border bg-os-panel text-os-sub hover:text-os-text"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
