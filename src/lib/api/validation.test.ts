import { describe, expect, it } from "vitest";
import {
  capitalAccessValue,
  coFounderStatusValue,
  heatLevelValue,
  isUuid,
  marketTypeValue,
  nullableDateValue,
  numberValue,
  phaseValue,
  priorStartupExperienceValue,
  priorityValue,
  riskCategoryValue,
  riskMatrixValue,
  riskStatusValue,
  taskCategoryValue,
  timeToCopyValue
} from "@/lib/api/validation";

describe("api validation helpers", () => {
  it("validates UUID values", () => {
    expect(isUuid("11111111-1111-4111-8111-111111111111")).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
  });

  it("clamps numeric values", () => {
    expect(numberValue(12, 5, 1, 10)).toBe(10);
    expect(numberValue(-1, 5, 1, 10)).toBe(1);
    expect(numberValue("7", 5, 1, 10)).toBe(7);
  });

  it("normalizes enums to safe fallbacks", () => {
    expect(phaseValue("1→10")).toBe("1→10");
    expect(phaseValue("bad")).toBe("0→1");
    expect(taskCategoryValue("sales")).toBe("sales");
    expect(taskCategoryValue("hiring")).toBe("hiring");
    expect(taskCategoryValue("bad")).toBe("research");
    expect(priorityValue("high")).toBe("high");
    expect(priorityValue("bad")).toBe("medium");
    expect(heatLevelValue("low")).toBe("low");
    expect(heatLevelValue("bad")).toBe("medium");
    expect(riskCategoryValue("regulatory")).toBe("regulatory");
    expect(riskCategoryValue("bad")).toBe("market");
    expect(riskMatrixValue("low")).toBe("low");
    expect(riskMatrixValue("bad")).toBe("high");
    expect(riskStatusValue("mitigated")).toBe("mitigated");
    expect(riskStatusValue("bad")).toBe("open");
    expect(marketTypeValue("clone_market")).toBe("clone_market");
    expect(marketTypeValue("bad")).toBe("existing_market");
    expect(timeToCopyValue("3_plus_years")).toBe("3_plus_years");
    expect(timeToCopyValue("bad")).toBe("1_year");
    expect(priorStartupExperienceValue("one_exit")).toBe("one_exit");
    expect(priorStartupExperienceValue("bad")).toBe("none");
    expect(coFounderStatusValue("team_assembled")).toBe("team_assembled");
    expect(coFounderStatusValue("bad")).toBe("solo");
    expect(capitalAccessValue("funded")).toBe("funded");
    expect(capitalAccessValue("bad")).toBe("bootstrapped");
  });

  it("accepts ISO date inputs only", () => {
    expect(nullableDateValue("2026-06-15")).toBe("2026-06-15");
    expect(nullableDateValue("15/06/2026")).toBeNull();
    expect(nullableDateValue("")).toBeNull();
  });
});

