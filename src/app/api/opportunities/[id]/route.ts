import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import {
  arrayOfStrings,
  capitalAccessValue,
  coFounderStatusValue,
  heatLevelValue,
  isUuid,
  jsonError,
  marketTypeValue,
  numberValue,
  phaseValue,
  priorStartupExperienceValue,
  readJsonObject,
  riskCategoryValue,
  riskMatrixValue,
  riskStatusValue,
  stringValue,
  timeToCopyValue
} from "@/lib/api/validation";
import { calculateOpportunityScore } from "@/lib/score";
import type { DecisionLogEntry, Milestone, Opportunity, RiskAssessment } from "@/types";

type Params = {
  params: {
    id: string;
  };
};

function sanitizeOpportunityPatch(body: Record<string, unknown>, current: Opportunity) {
  const patch: Partial<Opportunity> = {};

  if ("name" in body) patch.name = stringValue(body.name, current.name) || current.name;
  if ("problem_statement" in body) patch.problem_statement = stringValue(body.problem_statement, current.problem_statement);
  if ("target_customer_persona" in body) patch.target_customer_persona = stringValue(body.target_customer_persona, current.target_customer_persona);
  if ("urgency" in body) patch.urgency = numberValue(body.urgency, current.urgency, 1, 10);
  if ("pain" in body) patch.pain = numberValue(body.pain, current.pain, 1, 10);
  if ("frequency" in body) patch.frequency = numberValue(body.frequency, current.frequency, 1, 10);
  if ("willingness_to_pay" in body) patch.willingness_to_pay = numberValue(body.willingness_to_pay, current.willingness_to_pay, 1, 10);
  if ("customer_discovery_count" in body) patch.customer_discovery_count = numberValue(body.customer_discovery_count, current.customer_discovery_count, 0);
  if ("key_insight" in body) patch.key_insight = stringValue(body.key_insight, current.key_insight);
  if ("falsifiable_hypothesis" in body) patch.falsifiable_hypothesis = stringValue(body.falsifiable_hypothesis, current.falsifiable_hypothesis);
  if ("domain_expertise" in body) patch.domain_expertise = numberValue(body.domain_expertise, current.domain_expertise, 1, 10);
  if ("network_access" in body) patch.network_access = numberValue(body.network_access, current.network_access, 1, 10);
  if ("unfair_insight" in body) patch.unfair_insight = numberValue(body.unfair_insight, current.unfair_insight, 1, 10);
  if ("timing_signals" in body) patch.timing_signals = arrayOfStrings(body.timing_signals);
  if ("market_type" in body) patch.market_type = marketTypeValue(body.market_type, current.market_type);
  if ("business_model" in body) patch.business_model = stringValue(body.business_model, current.business_model);
  if ("pricing_model" in body) patch.pricing_model = stringValue(body.pricing_model, current.pricing_model);
  if ("acv" in body) patch.acv = stringValue(body.acv, current.acv);
  if ("tam_m" in body) patch.tam_m = numberValue(body.tam_m, current.tam_m, 0);
  if ("sam_m" in body) patch.sam_m = numberValue(body.sam_m, current.sam_m, 0);
  if ("som_m" in body) patch.som_m = numberValue(body.som_m, current.som_m, 0);
  if ("growth_rate_pct" in body) patch.growth_rate_pct = numberValue(body.growth_rate_pct, current.growth_rate_pct, 0);
  if ("competitors" in body) {
    patch.competitors = Array.isArray(body.competitors)
      ? body.competitors
          .filter((competitor): competitor is Record<string, unknown> => Boolean(competitor) && typeof competitor === "object")
          .map((competitor) => ({
            name: stringValue(competitor.name, "Competitor") || "Competitor",
            threat: heatLevelValue(competitor.threat, "medium"),
            differentiator: stringValue(competitor.differentiator),
            estimated_arr: stringValue(competitor.estimated_arr)
          }))
      : current.competitors;
  }
  if ("moat_network" in body) patch.moat_network = numberValue(body.moat_network, current.moat_network, 1, 10);
  if ("moat_data" in body) patch.moat_data = numberValue(body.moat_data, current.moat_data, 1, 10);
  if ("moat_switching" in body) patch.moat_switching = numberValue(body.moat_switching, current.moat_switching, 1, 10);
  if ("moat_scale" in body) patch.moat_scale = numberValue(body.moat_scale, current.moat_scale, 1, 10);
  if ("moat_brand" in body) patch.moat_brand = numberValue(body.moat_brand, current.moat_brand, 1, 10);
  if ("moat_ip" in body) patch.moat_ip = numberValue(body.moat_ip, current.moat_ip, 1, 10);
  if ("moat_summary" in body) patch.moat_summary = stringValue(body.moat_summary, current.moat_summary);
  if ("time_to_copy" in body) patch.time_to_copy = timeToCopyValue(body.time_to_copy, current.time_to_copy);
  if ("phase" in body) patch.phase = phaseValue(body.phase, current.phase);
  if ("kpi_primary" in body) patch.kpi_primary = stringValue(body.kpi_primary, current.kpi_primary);
  if ("kpi_revenue" in body) patch.kpi_revenue = stringValue(body.kpi_revenue, current.kpi_revenue);
  if ("kpi_learning" in body) patch.kpi_learning = stringValue(body.kpi_learning, current.kpi_learning);
  if ("sprint_goal_90_day" in body) patch.sprint_goal_90_day = stringValue(body.sprint_goal_90_day, current.sprint_goal_90_day);
  if ("runway_months" in body) patch.runway_months = numberValue(body.runway_months, current.runway_months, 0);
  if ("next_fundraise_trigger" in body) patch.next_fundraise_trigger = stringValue(body.next_fundraise_trigger, current.next_fundraise_trigger);
  if ("conviction_stars" in body) patch.conviction_stars = numberValue(body.conviction_stars, current.conviction_stars, 0, 5);
  if ("prior_startup_experience" in body) patch.prior_startup_experience = priorStartupExperienceValue(body.prior_startup_experience, current.prior_startup_experience);
  if ("co_founder_status" in body) patch.co_founder_status = coFounderStatusValue(body.co_founder_status, current.co_founder_status);
  if ("capital_access" in body) patch.capital_access = capitalAccessValue(body.capital_access, current.capital_access);
  if ("founder_statement" in body) patch.founder_statement = stringValue(body.founder_statement, current.founder_statement);
  if ("lois_verbal_commitments" in body) patch.lois_verbal_commitments = numberValue(body.lois_verbal_commitments, current.lois_verbal_commitments, 0);
  if ("waitlist_signups" in body) patch.waitlist_signups = numberValue(body.waitlist_signups, current.waitlist_signups, 0);
  if ("pilot_customers" in body) patch.pilot_customers = numberValue(body.pilot_customers, current.pilot_customers, 0);
  if ("revenue_to_date" in body) patch.revenue_to_date = numberValue(body.revenue_to_date, current.revenue_to_date, 0);
  if ("last_customer_conversation_date" in body) {
    const date = typeof body.last_customer_conversation_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.last_customer_conversation_date)
      ? body.last_customer_conversation_date
      : null;
    patch.last_customer_conversation_date = date;
  }
  if ("signal_notes" in body) patch.signal_notes = stringValue(body.signal_notes, current.signal_notes);

  return patch;
}

function sanitizeDecisionLog(value: unknown): DecisionLogEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
    .map((entry) => ({
      id: stringValue(entry.id, crypto.randomUUID()) || crypto.randomUUID(),
      body: stringValue(entry.body),
      created_at: stringValue(entry.created_at, new Date().toISOString()) || new Date().toISOString()
    }))
    .filter((entry) => entry.body);
}

function sanitizeMilestones(value: unknown, opportunityId: string, userId: string): Array<Omit<Milestone, "id" | "created_at">> {
  if (!Array.isArray(value)) return [];
  return value
    .filter((milestone): milestone is Record<string, unknown> => Boolean(milestone) && typeof milestone === "object")
    .map((milestone) => ({
      opportunity_id: opportunityId,
      user_id: userId,
      title: stringValue(milestone.title, "Untitled milestone") || "Untitled milestone",
      target_date: typeof milestone.target_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(milestone.target_date) ? milestone.target_date : null,
      done: Boolean(milestone.done)
    }));
}

export async function GET(_request: Request, { params }: Params) {
  if (!isUuid(params.id)) {
    return jsonError("Invalid opportunity id.", 400);
  }

  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const [{ data: opportunity, error }, notes, risks, tasks, milestones, documents, messages] = await Promise.all([
    supabase.from("opportunities").select("*").eq("id", params.id).or(`user_id.eq.${user.id},is_demo.eq.true`).single(),
    supabase.from("opportunity_notes").select("*").eq("opportunity_id", params.id).maybeSingle(),
    supabase.from("risk_assessments").select("*").eq("opportunity_id", params.id).order("created_at"),
    supabase.from("tasks").select("*").eq("opportunity_id", params.id).order("created_at"),
    supabase.from("milestones").select("*").eq("opportunity_id", params.id).order("created_at"),
    supabase.from("documents").select("*").eq("opportunity_id", params.id).order("created_at", { ascending: false }),
    supabase.from("ember_messages").select("*").eq("opportunity_id", params.id).order("created_at")
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({
    opportunity,
    notes: notes.data,
    risks: risks.data ?? [],
    tasks: tasks.data ?? [],
    milestones: milestones.data ?? [],
    documents: documents.data ?? [],
    messages: messages.data ?? []
  });
}

export async function PATCH(request: Request, { params }: Params) {
  if (!isUuid(params.id)) {
    return jsonError("Invalid opportunity id.", 400);
  }

  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { body, response: bodyResponse } = await readJsonObject(request);
  if (bodyResponse) return bodyResponse;

  const { data: currentOpportunity, error: currentError } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", params.id)
    .or(`user_id.eq.${user.id},is_demo.eq.true`)
    .single();

  if (currentError || !currentOpportunity) {
    return NextResponse.json({ error: currentError?.message ?? "Opportunity not found" }, { status: 404 });
  }

  if (currentOpportunity.is_demo) {
    return jsonError("Shared demos are read-only. Copy this demo to your workspace before editing.", 403);
  }

  const opportunityPatch = sanitizeOpportunityPatch(body, currentOpportunity);

  const notes = body.notes;
  if (notes) {
    if (typeof notes !== "object" || Array.isArray(notes)) {
      return jsonError("Notes must be an object.");
    }

    const { error } = await supabase
      .from("opportunity_notes")
      .upsert(
        {
          opportunity_id: params.id,
          user_id: user.id,
          thesis: stringValue((notes as Record<string, unknown>).thesis),
          customer_notes: stringValue((notes as Record<string, unknown>).customer_notes),
          open_questions: stringValue((notes as Record<string, unknown>).open_questions),
          kill_conditions: stringValue((notes as Record<string, unknown>).kill_conditions),
          moat_insight: stringValue((notes as Record<string, unknown>).moat_insight),
          decision_log: sanitizeDecisionLog((notes as Record<string, unknown>).decision_log)
        },
        { onConflict: "opportunity_id" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  let nextRisks: Pick<RiskAssessment, "heat_level" | "status">[] | null = null;
  const risks = body.risks;
  if (Array.isArray(risks)) {
    const deleteResult = await supabase.from("risk_assessments").delete().eq("opportunity_id", params.id).eq("user_id", user.id);
    if (deleteResult.error) {
      return NextResponse.json({ error: deleteResult.error.message }, { status: 500 });
    }

    if (risks.length > 0) {
      const sanitizedRisks = risks
        .filter((risk): risk is Record<string, unknown> => Boolean(risk) && typeof risk === "object")
        .map((risk) => ({
          opportunity_id: params.id,
          user_id: user.id,
          risk_label: stringValue(risk.risk_label, "Unlabeled risk") || "Unlabeled risk",
          heat_level: heatLevelValue(risk.heat_level),
          category: riskCategoryValue(risk.category),
          likelihood: riskMatrixValue(risk.likelihood),
          impact: riskMatrixValue(risk.impact),
          mitigation_note: stringValue(risk.mitigation_note),
          owner: stringValue(risk.owner),
          status: riskStatusValue(risk.status)
        }));

      const insertResult = await supabase.from("risk_assessments").insert(sanitizedRisks);

      if (insertResult.error) {
        return NextResponse.json({ error: insertResult.error.message }, { status: 500 });
      }

      nextRisks = sanitizedRisks;
    } else {
      nextRisks = [];
    }
  }

  let nextMilestones: Pick<Milestone, "done">[] | null = null;
  const milestones = body.milestones;
  if (Array.isArray(milestones)) {
    const deleteResult = await supabase.from("milestones").delete().eq("opportunity_id", params.id).eq("user_id", user.id);
    if (deleteResult.error) {
      return NextResponse.json({ error: deleteResult.error.message }, { status: 500 });
    }

    const sanitizedMilestones = sanitizeMilestones(milestones, params.id, user.id);
    if (sanitizedMilestones.length > 0) {
      const insertResult = await supabase.from("milestones").insert(sanitizedMilestones);
      if (insertResult.error) {
        return NextResponse.json({ error: insertResult.error.message }, { status: 500 });
      }
    }
    nextMilestones = sanitizedMilestones;
  }

  const [{ data: latestRisks }, { data: tasks }, { data: latestMilestones }] = await Promise.all([
    nextRisks ? Promise.resolve({ data: nextRisks }) : supabase.from("risk_assessments").select("heat_level,status").eq("opportunity_id", params.id).eq("user_id", user.id),
    supabase.from("tasks").select("done").eq("opportunity_id", params.id).eq("user_id", user.id),
    nextMilestones ? Promise.resolve({ data: nextMilestones }) : supabase.from("milestones").select("done").eq("opportunity_id", params.id).eq("user_id", user.id)
  ]);

  const score = calculateOpportunityScore({ ...currentOpportunity, ...opportunityPatch }, latestRisks ?? [], tasks ?? [], latestMilestones ?? []);

  const { data, error } = await supabase
    .from("opportunities")
    .update({ ...opportunityPatch, opportunity_score: score })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ opportunity: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!isUuid(params.id)) {
    return jsonError("Invalid opportunity id.", 400);
  }

  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunities")
    .select("id,is_demo")
    .eq("id", params.id)
    .or(`user_id.eq.${user.id},is_demo.eq.true`)
    .single();

  if (opportunityError || !opportunity) {
    return NextResponse.json({ error: opportunityError?.message ?? "Opportunity not found" }, { status: 404 });
  }

  if (opportunity.is_demo) {
    return jsonError("Shared demos cannot be deleted.", 403);
  }

  const { data: documents } = await supabase.from("documents").select("storage_path").eq("opportunity_id", params.id).eq("user_id", user.id);
  const paths = (documents ?? []).map((document) => document.storage_path).filter(Boolean);
  if (paths.length > 0) {
    const cleanup = await supabase.storage.from("documents").remove(paths);
    if (cleanup.error) {
      console.error("Failed to clean up opportunity documents", cleanup.error);
    }
  }

  const { error } = await supabase.from("opportunities").delete().eq("id", params.id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
