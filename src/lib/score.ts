import type { Milestone, Opportunity, RiskAssessment, Task } from "@/types";

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

function signalScore(opportunity: Partial<Pick<Opportunity, "lois_verbal_commitments" | "pilot_customers" | "revenue_to_date" | "waitlist_signups">>) {
  const lois = Number(opportunity.lois_verbal_commitments ?? 0);
  const pilots = Number(opportunity.pilot_customers ?? 0);
  const revenue = Number(opportunity.revenue_to_date ?? 0);
  const waitlist = Number(opportunity.waitlist_signups ?? 0);
  if (revenue > 0 || pilots >= 3) return 10;
  if (pilots > 0 || lois >= 5) return 8;
  if (lois > 0 || waitlist >= 50) return 6;
  if (waitlist > 0) return 4;
  return 2;
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
  > &
    Partial<
      Pick<
        Opportunity,
        | "customer_discovery_count"
        | "conviction_stars"
        | "prior_startup_experience"
        | "co_founder_status"
        | "capital_access"
        | "lois_verbal_commitments"
        | "waitlist_signups"
        | "pilot_customers"
        | "revenue_to_date"
      >
    >,
  risks: Pick<RiskAssessment, "heat_level" | "status">[] = [],
  tasks: Pick<Task, "done">[] = [],
  milestones: Pick<Milestone, "done">[] = []
) {
  const problemScore =
    avg([opportunity.urgency, opportunity.pain, opportunity.frequency, opportunity.willingness_to_pay]) * 0.3;
  const marketScore = tamScore(Number(opportunity.tam_m)) * 0.2;
  const weightedGrowthScore = growthScore(opportunity.growth_rate_pct) * 0.1;
  const convictionBoost = (opportunity.conviction_stars ?? 0) * 0.4;
  const experienceBoost = opportunity.prior_startup_experience === "multiple_exits" ? 1 : opportunity.prior_startup_experience === "one_exit" || opportunity.prior_startup_experience === "currently_operating" ? 0.6 : 0;
  const teamBoost = opportunity.co_founder_status === "team_assembled" ? 0.8 : opportunity.co_founder_status === "co_founder_found" ? 0.5 : 0;
  const capitalBoost = opportunity.capital_access === "funded" ? 0.8 : opportunity.capital_access === "seeking_seed" ? 0.4 : 0;
  const founderEdge = clamp(avg([opportunity.domain_expertise, opportunity.network_access, opportunity.unfair_insight]) + convictionBoost + experienceBoost + teamBoost + capitalBoost, 1, 10) * 0.12;
  const moatScore =
    avg([
      opportunity.moat_network,
      opportunity.moat_data,
      opportunity.moat_switching,
      opportunity.moat_scale,
      opportunity.moat_brand,
      opportunity.moat_ip
    ]) * 0.15;
  const timingBonus = (opportunity.timing_signals.length > 0 ? 8 : 4) * 0.08;
  const discoveryBonus = Math.min(Number(opportunity.customer_discovery_count ?? 0) / 10, 2);
  const validationSignal = signalScore(opportunity) * 0.12;
  const riskPenalty = risks.filter((risk) => risk.heat_level === "high" && risk.status !== "mitigated").length * 0.12;
  const taskMomentum = Math.min(tasks.filter((task) => task.done).length * 0.25, 2);
  const milestoneMomentum = Math.min(milestones.filter((milestone) => milestone.done).length * 0.6, 2.4);
  const raw =
    problemScore +
    marketScore +
    weightedGrowthScore +
    founderEdge +
    moatScore +
    timingBonus +
    validationSignal +
    discoveryBonus -
    riskPenalty +
    taskMomentum +
    milestoneMomentum;

  return clamp(Math.round(raw * 4.5), 0, 100);
}

export function scoreTone(score: number) {
  if (score >= 75) return "green";
  if (score >= 50) return "amber";
  return "indigo";
}
