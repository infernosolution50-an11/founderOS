import { cn } from "@/lib/utils";

type DotRatingProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export function DotRating({ label, value, onChange }: DotRatingProps) {
  return (
    <div className="rounded-2xl border border-os-border bg-os-surface p-4">
      <div className="mb-4 font-display text-sm font-semibold text-os-text">{label}</div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((dot) => (
          <button
            key={dot}
            type="button"
            onClick={() => onChange(dot)}
            className={cn(
              "h-4 w-4 rounded-full border transition",
              dot <= value ? "border-os-indigo bg-os-indigo" : "border-os-border bg-os-panel"
            )}
            aria-label={`${label} ${dot}`}
          />
        ))}
      </div>
    </div>
  );
}
