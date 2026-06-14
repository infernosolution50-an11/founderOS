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
    <label className="block rounded-2xl border border-os-border bg-os-surface p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="font-display text-sm font-semibold text-os-text">{label}</span>
        <span className="rounded-full bg-os-panel px-3 py-1 text-sm text-os-sub">
          {value}
          {suffix}
        </span>
      </div>
      <input
        className="mt-4 w-full accent-os-indigo"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
