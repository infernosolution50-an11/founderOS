import { describe, expect, it } from "vitest";
import { calculateOpportunityScore } from "@/lib/score";

const baseOpportunity = {
  urgency: 5,
  pain: 5,
  frequency: 5,
  willingness_to_pay: 5,
  tam_m: 100,
  growth_rate_pct: 20,
  domain_expertise: 3,
  network_access: 3,
  unfair_insight: 3,
  moat_network: 5,
  moat_data: 4,
  moat_switching: 6,
  moat_scale: 3,
  moat_brand: 5,
  moat_ip: 2,
  timing_signals: []
};

describe("calculateOpportunityScore", () => {
  it("keeps scores inside the 0 to 100 range", () => {
    expect(calculateOpportunityScore(baseOpportunity)).toBeGreaterThanOrEqual(0);
    expect(calculateOpportunityScore(baseOpportunity)).toBeLessThanOrEqual(100);
  });

  it("rewards stronger market and problem signals", () => {
    const weak = calculateOpportunityScore(baseOpportunity);
    const strong = calculateOpportunityScore({
      ...baseOpportunity,
      urgency: 10,
      pain: 10,
      frequency: 10,
      willingness_to_pay: 10,
      tam_m: 2500,
      growth_rate_pct: 60,
      timing_signals: ["Regulation", "Behavior shift"]
    });

    expect(strong).toBeGreaterThan(weak);
  });

  it("adds momentum for completed tasks", () => {
    const noMomentum = calculateOpportunityScore(baseOpportunity);
    const withMomentum = calculateOpportunityScore(baseOpportunity, [], [{ done: true }, { done: true }]);

    expect(withMomentum).toBeGreaterThan(noMomentum);
  });
});

