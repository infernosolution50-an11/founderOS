import { cn } from "@/lib/utils";
import { scoreTone } from "@/lib/score";
import { Badge } from "@/components/ui/Badge";

type OpportunityScoreProps = {
  score: number;
};

export function OpportunityScore({ score }: OpportunityScoreProps) {
  const tone = scoreTone(score);

  return (
    <Badge
      tone={tone === "green" ? "green" : tone === "amber" ? "amber" : "indigo"}
      className={cn("animate-score-flash px-4 py-2 text-sm font-bold")}
      aria-label={`Opportunity Score ${score}`}
    >
      Score {score}
    </Badge>
  );
}
