import { NextResponse } from "next/server";
import type {
  CapitalAccess,
  CoFounderStatus,
  HeatLevel,
  MarketType,
  Phase,
  PriorStartupExperience,
  Priority,
  RiskCategory,
  RiskMatrixValue,
  RiskStatus,
  TaskCategory,
  TimeToCopy
} from "@/types";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const phases: Phase[] = ["0→1", "1→10", "10→100"];
const taskCategories: TaskCategory[] = ["research", "product", "sales", "ops", "hiring"];
const priorities: Priority[] = ["low", "medium", "high"];
const heatLevels: HeatLevel[] = ["low", "medium", "high"];
const riskCategories: RiskCategory[] = ["market", "technical", "regulatory", "team", "financial", "timing"];
const riskMatrixValues: RiskMatrixValue[] = ["low", "high"];
const riskStatuses: RiskStatus[] = ["open", "in_progress", "mitigated"];
const marketTypes: MarketType[] = ["new_market", "existing_market", "resegmented_market", "clone_market"];
const timeToCopyValues: TimeToCopy[] = ["3_months", "6_months", "1_year", "3_plus_years"];
const priorStartupExperienceValues: PriorStartupExperience[] = ["none", "one_exit", "multiple_exits", "currently_operating"];
const coFounderStatusValues: CoFounderStatus[] = ["solo", "co_founder_found", "team_assembled"];
const capitalAccessValues: CapitalAccess[] = ["bootstrapped", "friends_family", "seeking_seed", "funded"];

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

export async function readJsonObject(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { body: null, response: jsonError("Request body must be an object.") };
    }
    return { body: body as Record<string, unknown>, response: null };
  } catch {
    return { body: null, response: jsonError("Invalid JSON body.") };
  }
}

export function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export function numberValue(value: unknown, fallback: number, min?: number, max?: number) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  const next = Number.isFinite(parsed) ? parsed : fallback;
  return Math.min(Math.max(next, min ?? next), max ?? next);
}

export function arrayOfStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [];
}

export function phaseValue(value: unknown, fallback: Phase = "0→1") {
  return phases.includes(value as Phase) ? (value as Phase) : fallback;
}

export function taskCategoryValue(value: unknown, fallback: TaskCategory = "research") {
  return taskCategories.includes(value as TaskCategory) ? (value as TaskCategory) : fallback;
}

export function priorityValue(value: unknown, fallback: Priority = "medium") {
  return priorities.includes(value as Priority) ? (value as Priority) : fallback;
}

export function heatLevelValue(value: unknown, fallback: HeatLevel = "medium") {
  return heatLevels.includes(value as HeatLevel) ? (value as HeatLevel) : fallback;
}

export function riskCategoryValue(value: unknown, fallback: RiskCategory = "market") {
  return riskCategories.includes(value as RiskCategory) ? (value as RiskCategory) : fallback;
}

export function riskMatrixValue(value: unknown, fallback: RiskMatrixValue = "high") {
  return riskMatrixValues.includes(value as RiskMatrixValue) ? (value as RiskMatrixValue) : fallback;
}

export function riskStatusValue(value: unknown, fallback: RiskStatus = "open") {
  return riskStatuses.includes(value as RiskStatus) ? (value as RiskStatus) : fallback;
}

export function marketTypeValue(value: unknown, fallback: MarketType = "existing_market") {
  return marketTypes.includes(value as MarketType) ? (value as MarketType) : fallback;
}

export function timeToCopyValue(value: unknown, fallback: TimeToCopy = "1_year") {
  return timeToCopyValues.includes(value as TimeToCopy) ? (value as TimeToCopy) : fallback;
}

export function priorStartupExperienceValue(value: unknown, fallback: PriorStartupExperience = "none") {
  return priorStartupExperienceValues.includes(value as PriorStartupExperience) ? (value as PriorStartupExperience) : fallback;
}

export function coFounderStatusValue(value: unknown, fallback: CoFounderStatus = "solo") {
  return coFounderStatusValues.includes(value as CoFounderStatus) ? (value as CoFounderStatus) : fallback;
}

export function capitalAccessValue(value: unknown, fallback: CapitalAccess = "bootstrapped") {
  return capitalAccessValues.includes(value as CapitalAccess) ? (value as CapitalAccess) : fallback;
}

export function nullableDateValue(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

