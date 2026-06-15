import { describe, expect, it } from "vitest";
import { heatLevelValue, isUuid, nullableDateValue, numberValue, phaseValue, priorityValue, taskCategoryValue } from "@/lib/api/validation";

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
    expect(taskCategoryValue("bad")).toBe("research");
    expect(priorityValue("high")).toBe("high");
    expect(priorityValue("bad")).toBe("medium");
    expect(heatLevelValue("low")).toBe("low");
    expect(heatLevelValue("bad")).toBe("medium");
  });

  it("accepts ISO date inputs only", () => {
    expect(nullableDateValue("2026-06-15")).toBe("2026-06-15");
    expect(nullableDateValue("15/06/2026")).toBeNull();
    expect(nullableDateValue("")).toBeNull();
  });
});

