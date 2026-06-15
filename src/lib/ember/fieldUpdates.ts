import type {
  CapitalAccess,
  CoFounderStatus,
  Competitor,
  HeatLevel,
  MarketType,
  Milestone,
  Opportunity,
  OpportunityNotes,
  Phase,
  PriorStartupExperience,
  RiskAssessment,
  RiskCategory,
  RiskMatrixValue,
  RiskStatus,
  TimeToCopy
} from "@/types";

export type EmberFieldPatch = {
  opportunity: Partial<Opportunity>;
  notes: Partial<OpportunityNotes>;
  risks?: Array<Partial<RiskAssessment>>;
  milestones?: Array<Partial<Milestone>>;
};

const opportunityTextFields = [
  "name",
  "problem_statement",
  "target_customer_persona",
  "key_insight",
  "falsifiable_hypothesis",
  "business_model",
  "pricing_model",
  "acv",
  "moat_summary",
  "kpi_primary",
  "kpi_revenue",
  "kpi_learning",
  "sprint_goal_90_day",
  "next_fundraise_trigger",
  "founder_statement",
  "signal_notes"
] as const satisfies readonly (keyof Opportunity)[];

const notesTextFields = ["thesis", "customer_notes", "open_questions", "kill_conditions", "moat_insight"] as const satisfies readonly (keyof OpportunityNotes)[];

const opportunityNumberFields = {
  urgency: [1, 10],
  pain: [1, 10],
  frequency: [1, 10],
  willingness_to_pay: [1, 10],
  customer_discovery_count: [0, Number.POSITIVE_INFINITY],
  domain_expertise: [1, 10],
  network_access: [1, 10],
  unfair_insight: [1, 10],
  tam_m: [0, Number.POSITIVE_INFINITY],
  sam_m: [0, Number.POSITIVE_INFINITY],
  som_m: [0, Number.POSITIVE_INFINITY],
  growth_rate_pct: [0, Number.POSITIVE_INFINITY],
  moat_network: [1, 10],
  moat_data: [1, 10],
  moat_switching: [1, 10],
  moat_scale: [1, 10],
  moat_brand: [1, 10],
  moat_ip: [1, 10],
  runway_months: [0, Number.POSITIVE_INFINITY],
  conviction_stars: [0, 5],
  lois_verbal_commitments: [0, Number.POSITIVE_INFINITY],
  waitlist_signups: [0, Number.POSITIVE_INFINITY],
  pilot_customers: [0, Number.POSITIVE_INFINITY],
  revenue_to_date: [0, Number.POSITIVE_INFINITY]
} as const satisfies Partial<Record<keyof Opportunity, readonly [number, number]>>;

const phases: Phase[] = ["0→1", "1→10", "10→100"];
const marketTypes: MarketType[] = ["new_market", "existing_market", "resegmented_market", "clone_market"];
const timeToCopyValues: TimeToCopy[] = ["3_months", "6_months", "1_year", "3_plus_years"];
const priorStartupExperienceValues: PriorStartupExperience[] = ["none", "one_exit", "multiple_exits", "currently_operating"];
const coFounderStatusValues: CoFounderStatus[] = ["solo", "co_founder_found", "team_assembled"];
const capitalAccessValues: CapitalAccess[] = ["bootstrapped", "friends_family", "seeking_seed", "funded"];
const heatLevels: HeatLevel[] = ["low", "medium", "high"];
const riskCategories: RiskCategory[] = ["market", "technical", "regulatory", "team", "financial", "timing"];
const riskMatrixValues: RiskMatrixValue[] = ["low", "high"];
const riskStatuses: RiskStatus[] = ["open", "in_progress", "mitigated"];

const enumAliases: Record<string, string> = {
  "0->1": "0→1",
  "0 to 1": "0→1",
  "1->10": "1→10",
  "1 to 10": "1→10",
  "10->100": "10→100",
  "10 to 100": "10→100",
  "new market": "new_market",
  "existing market": "existing_market",
  "re-segmented market": "resegmented_market",
  "resegmented market": "resegmented_market",
  "clone market": "clone_market",
  "3 months": "3_months",
  "6 months": "6_months",
  "1 year": "1_year",
  "3+ years": "3_plus_years",
  "multiple exits": "multiple_exits",
  "1 exit": "one_exit",
  "one exit": "one_exit",
  "currently operating": "currently_operating",
  "co-founder found": "co_founder_found",
  "cofounder found": "co_founder_found",
  "team assembled": "team_assembled",
  "friends & family": "friends_family",
  "friends and family": "friends_family",
  "seeking seed": "seeking_seed",
  "in progress": "in_progress"
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function unwrapFieldValue(value: unknown) {
  const record = asRecord(value);
  return record && "value" in record ? record.value : value;
}

function stringFrom(value: unknown) {
  const raw = unwrapFieldValue(value);
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "number" || typeof raw === "boolean") return String(raw);
  return undefined;
}

function numberFrom(value: unknown, min: number, max: number) {
  const raw = unwrapFieldValue(value);
  const parsed = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.replace(/[$,%]/g, "")) : Number.NaN;
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(Math.max(parsed, min), max);
}

function enumFrom<T extends string>(value: unknown, allowed: readonly T[]) {
  const raw = stringFrom(value);
  if (!raw) return undefined;
  const normalized = enumAliases[raw.toLowerCase()] ?? raw.toLowerCase().replace(/[\s-]+/g, "_");
  return allowed.includes(normalized as T) ? (normalized as T) : allowed.includes(raw as T) ? (raw as T) : undefined;
}

function dateFrom(value: unknown) {
  const raw = stringFrom(value);
  if (!raw) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : undefined;
}

function stringArrayFrom(value: unknown) {
  const raw = unwrapFieldValue(value);
  if (Array.isArray(raw)) return raw.map((item) => stringFrom(item)).filter((item): item is string => Boolean(item));
  if (typeof raw === "string") return raw.split(",").map((item) => item.trim()).filter(Boolean);
  return undefined;
}

function competitorsFrom(value: unknown) {
  const raw = unwrapFieldValue(value);
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map((item): Competitor | null => {
      const competitor = asRecord(item);
      if (!competitor) return null;
      return {
        name: stringFrom(competitor.name) || "Competitor",
        threat: enumFrom(competitor.threat ?? competitor.threat_level, heatLevels) ?? "medium",
        differentiator: stringFrom(competitor.differentiator),
        estimated_arr: stringFrom(competitor.estimated_arr)
      };
    })
    .filter((item): item is Competitor => Boolean(item));
}

function decisionLogFrom(value: unknown) {
  const raw = unwrapFieldValue(value);
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map((item) => {
      const entry = asRecord(item);
      if (!entry) return null;
      const body = stringFrom(entry.body ?? entry.note ?? entry.text);
      if (!body) return null;
      return {
        id: stringFrom(entry.id) || crypto.randomUUID(),
        body,
        created_at: stringFrom(entry.created_at) || new Date().toISOString()
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function extractJsonPayloads(content: string) {
  const candidates = [...content.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map((match) => match[1].trim());
  candidates.push(content.trim());

  const firstObjectStart = content.indexOf("{");
  const lastObjectEnd = content.lastIndexOf("}");
  if (firstObjectStart >= 0 && lastObjectEnd > firstObjectStart) {
    candidates.push(content.slice(firstObjectStart, lastObjectEnd + 1));
  }

  return [...new Set(candidates)]
    .map((candidate) => {
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    })
    .filter((payload): payload is Record<string, unknown> => Boolean(asRecord(payload)));
}

export function normalizeEmberFieldPatch(payload: unknown): EmberFieldPatch {
  const root = asRecord(payload);
  const fields = asRecord(root?.fields) ?? root ?? {};
  const opportunitySource = { ...fields, ...(asRecord(fields.opportunity) ?? {}) };
  const notesSource = asRecord(fields.notes) ?? {};
  const opportunity: Partial<Opportunity> = {};
  const notes: Partial<OpportunityNotes> = {};

  for (const field of opportunityTextFields) {
    if (field in opportunitySource) {
      const value = stringFrom(opportunitySource[field]);
      if (value !== undefined) opportunity[field] = value as never;
    }
  }

  for (const [field, [min, max]] of Object.entries(opportunityNumberFields) as Array<[keyof Opportunity, readonly [number, number]]>) {
    if (field in opportunitySource) {
      const value = numberFrom(opportunitySource[field], min, max);
      if (value !== undefined) opportunity[field] = value as never;
    }
  }

  if ("timing_signals" in opportunitySource) {
    const value = stringArrayFrom(opportunitySource.timing_signals);
    if (value) opportunity.timing_signals = value;
  }
  if ("competitors" in opportunitySource) {
    const value = competitorsFrom(opportunitySource.competitors);
    if (value) opportunity.competitors = value;
  }
  if ("phase" in opportunitySource) opportunity.phase = enumFrom(opportunitySource.phase, phases);
  if ("market_type" in opportunitySource) opportunity.market_type = enumFrom(opportunitySource.market_type, marketTypes);
  if ("time_to_copy" in opportunitySource) opportunity.time_to_copy = enumFrom(opportunitySource.time_to_copy, timeToCopyValues);
  if ("prior_startup_experience" in opportunitySource) opportunity.prior_startup_experience = enumFrom(opportunitySource.prior_startup_experience, priorStartupExperienceValues);
  if ("co_founder_status" in opportunitySource) opportunity.co_founder_status = enumFrom(opportunitySource.co_founder_status, coFounderStatusValues);
  if ("capital_access" in opportunitySource) opportunity.capital_access = enumFrom(opportunitySource.capital_access, capitalAccessValues);
  if ("last_customer_conversation_date" in opportunitySource) {
    const value = dateFrom(opportunitySource.last_customer_conversation_date);
    if (value !== undefined) opportunity.last_customer_conversation_date = value;
  }

  for (const field of notesTextFields) {
    if (field in notesSource) {
      const value = stringFrom(notesSource[field]);
      if (value !== undefined) notes[field] = value as never;
    }
  }
  if ("decision_log" in notesSource) {
    const value = decisionLogFrom(notesSource.decision_log);
    if (value) notes.decision_log = value;
  }

  const risks = Array.isArray(fields.risks)
    ? fields.risks
        .map((item): Partial<RiskAssessment> | null => {
          const risk = asRecord(item);
          if (!risk) return null;
          return {
            id: stringFrom(risk.id),
            risk_label: stringFrom(risk.risk_label ?? risk.label ?? risk.name) || "Untitled risk",
            category: enumFrom(risk.category, riskCategories) ?? "market",
            heat_level: enumFrom(risk.heat_level ?? risk.heat, heatLevels) ?? "medium",
            likelihood: enumFrom(risk.likelihood, riskMatrixValues) ?? "high",
            impact: enumFrom(risk.impact, riskMatrixValues) ?? "high",
            mitigation_note: stringFrom(risk.mitigation_note ?? risk.mitigation) || "",
            owner: stringFrom(risk.owner) || "Founder",
            status: enumFrom(risk.status, riskStatuses) ?? "open",
            created_at: stringFrom(risk.created_at)
          };
        })
        .filter((item): item is Partial<RiskAssessment> => Boolean(item))
    : undefined;

  const milestones = Array.isArray(fields.milestones)
    ? fields.milestones
        .map((item): Partial<Milestone> | null => {
          const milestone = asRecord(item);
          if (!milestone) return null;
          const targetDate = dateFrom(milestone.target_date);
          return {
            id: stringFrom(milestone.id),
            title: stringFrom(milestone.title) || "Untitled milestone",
            target_date: targetDate === undefined ? null : targetDate,
            done: Boolean(unwrapFieldValue(milestone.done)),
            created_at: stringFrom(milestone.created_at)
          };
        })
        .filter((item): item is Partial<Milestone> => Boolean(item))
    : undefined;

  return { opportunity, notes, risks, milestones };
}
