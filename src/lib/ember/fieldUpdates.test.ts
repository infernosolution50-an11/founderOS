import { describe, expect, it } from "vitest";
import { extractJsonPayloads, normalizeEmberFieldPatch } from "./fieldUpdates";

describe("extractJsonPayloads", () => {
  it("parses fenced and prose-wrapped JSON payloads", () => {
    expect(extractJsonPayloads('Here are updates:\n```json\n{"fields":{"opportunity":{"urgency":8}}}\n```')).toHaveLength(1);
    expect(extractJsonPayloads('Use this {"fields":{"opportunity":{"pain":7}}} please')).toHaveLength(1);
  });
});

describe("normalizeEmberFieldPatch", () => {
  it("unwraps confidence values and clamps slider fields", () => {
    const patch = normalizeEmberFieldPatch({
      fields: {
        opportunity: {
          urgency: { value: 14, confidence: "low" },
          moat_network: { value: "0", confidence: "medium" },
          conviction_stars: { value: 9, confidence: "high" }
        }
      }
    });

    expect(patch.opportunity).toMatchObject({
      urgency: 10,
      moat_network: 1,
      conviction_stars: 5
    });
  });

  it("normalizes enum aliases and array-like fields", () => {
    const patch = normalizeEmberFieldPatch({
      fields: {
        opportunity: {
          phase: "0->1",
          market_type: "re-segmented market",
          time_to_copy: "3+ years",
          timing_signals: "AI budgets, SOC2 pressure"
        }
      }
    });

    expect(patch.opportunity).toMatchObject({
      phase: "0→1",
      market_type: "resegmented_market",
      time_to_copy: "3_plus_years",
      timing_signals: ["AI budgets", "SOC2 pressure"]
    });
  });

  it("normalizes risks, milestones, notes, and top-level opportunity patches", () => {
    const patch = normalizeEmberFieldPatch({
      kpi_primary: "5 paid pilots",
      notes: {
        thesis: { value: "Finance teams need faster SaaS approvals.", confidence: "medium" },
        decision_log: { value: [{ body: "Focused on mid-market finance teams." }], confidence: "medium" }
      },
      risks: [{ label: "No budget owner", category: "financial", heat: "high", likelihood: "high", impact: "high" }],
      milestones: [{ title: "Close first paid pilot", target_date: "2026-08-01", done: false }]
    });

    expect(patch.opportunity.kpi_primary).toBe("5 paid pilots");
    expect(patch.notes.thesis).toBe("Finance teams need faster SaaS approvals.");
    expect(patch.notes.decision_log?.[0]?.body).toBe("Focused on mid-market finance teams.");
    expect(patch.risks?.[0]).toMatchObject({ risk_label: "No budget owner", category: "financial", heat_level: "high" });
    expect(patch.milestones?.[0]).toMatchObject({ title: "Close first paid pilot", target_date: "2026-08-01" });
  });
});
