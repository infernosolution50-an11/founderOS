import { Card } from "@/components/ui/Card";

type SliderProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  suffix?: string;
  onChange: (value: number) => void;
};

export function Slider({ label, value, min = 1, max = 10, suffix = "", onChange }: SliderProps) {
  return (
    <Card>
      <label className="block">
      <div className="flex items-center justify-between gap-4">
        <span className="font-display text-os-sm font-semibold text-os-text">{label}</span>
        <span className="min-w-12 rounded-full bg-os-surface px-3 py-1 text-center font-display text-os-sm text-os-sub">
          {value}
          {suffix}
        </span>
      </div>
      <input
        className="mt-4 h-4 w-full cursor-pointer accent-os-indigo"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      </label>
    </Card>
  );
}
