import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

type DotRatingProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export function DotRating({ label, value, onChange }: DotRatingProps) {
  return (
    <Card>
      <div className="mb-3 font-display text-os-sm font-semibold text-os-text">{label}</div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((dot) => (
          <button
            key={dot}
            type="button"
            onClick={() => onChange(dot)}
            className={cn(
              "motion-safe-transition flex h-11 min-h-11 w-11 min-w-11 items-center justify-center rounded-full border active:scale-[0.97] md:h-9 md:min-h-9 md:w-9 md:min-w-9",
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
