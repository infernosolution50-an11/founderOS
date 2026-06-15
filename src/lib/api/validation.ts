import { NextResponse } from "next/server";
import type { HeatLevel, Phase, Priority, TaskCategory } from "@/types";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const phases: Phase[] = ["0→1", "1→10", "10→100"];
const taskCategories: TaskCategory[] = ["research", "product", "sales", "ops"];
const priorities: Priority[] = ["low", "medium", "high"];
const heatLevels: HeatLevel[] = ["low", "medium", "high"];

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

export function nullableDateValue(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

