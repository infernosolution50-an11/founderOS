import { cn } from "@/lib/utils";
import { scoreTone } from "@/lib/score";

type OpportunityScoreProps = {
  score: number;
};

export function OpportunityScore({ score }: OpportunityScoreProps) {
  const tone = scoreTone(score);

  return (
    <span
      className={cn(
        "rounded-full border px-4 py-2 font-display text-sm font-semibold",
        tone === "green" && "border-os-green/50 bg-os-green/15 text-os-green",
        tone === "amber" && "border-os-amber/50 bg-os-amber/15 text-os-amber",
        tone === "indigo" && "border-os-indigo/50 bg-os-indigo/15 text-os-indigo"
      )}
    >
      Score {score}
    </span>
  );
}
