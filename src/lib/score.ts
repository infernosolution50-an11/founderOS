import type { Opportunity, RiskAssessment, Task } from "@/types";

function avg(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function tamScore(tamM: number) {
  if (tamM > 1000) return 10;
  if (tamM > 100) return 7;
  if (tamM > 10) return 5;
  return 3;
}

function growthScore(growthRatePct: number) {
  if (growthRatePct > 50) return 10;
  if (growthRatePct > 25) return 8;
  if (growthRatePct > 10) return 6;
  return 4;
}

export function calculateOpportunityScore(
  opportunity: Pick<
    Opportunity,
    | "urgency"
    | "pain"
    | "frequency"
    | "willingness_to_pay"
    | "tam_m"
    | "growth_rate_pct"
    | "domain_expertise"
    | "network_access"
    | "unfair_insight"
    | "moat_network"
    | "moat_data"
    | "moat_switching"
    | "moat_scale"
    | "moat_brand"
    | "moat_ip"
    | "timing_signals"
  >,
  risks: Pick<RiskAssessment, "heat_level">[] = [],
  tasks: Pick<Task, "done">[] = []
) {
  const problemScore =
    avg([opportunity.urgency, opportunity.pain, opportunity.frequency, opportunity.willingness_to_pay]) * 0.3;
  const marketScore = tamScore(Number(opportunity.tam_m)) * 0.2;
  const weightedGrowthScore = growthScore(opportunity.growth_rate_pct) * 0.1;
  const founderEdge = avg([opportunity.domain_expertise, opportunity.network_access, opportunity.unfair_insight]) * 0.1;
  const moatScore =
    avg([
      opportunity.moat_network,
      opportunity.moat_data,
      opportunity.moat_switching,
      opportunity.moat_scale,
      opportunity.moat_brand,
      opportunity.moat_ip
    ]) * 0.15;
  const timingBonus = (opportunity.timing_signals.length > 0 ? 8 : 4) * 0.1;
  const riskPenalty = risks.filter((risk) => risk.heat_level === "high").length * 0.025;
  const momentumBonus = Math.min(tasks.filter((task) => task.done).length * 0.3, 3);
  const raw = problemScore + marketScore + weightedGrowthScore + founderEdge + moatScore + timingBonus - riskPenalty + momentumBonus;

  return clamp(Math.round(raw * 4.5), 0, 100);
}

export function scoreTone(score: number) {
  if (score >= 75) return "green";
  if (score >= 50) return "amber";
  return "indigo";
}
