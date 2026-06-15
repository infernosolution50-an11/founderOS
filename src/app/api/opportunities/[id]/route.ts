import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import {
  arrayOfStrings,
  heatLevelValue,
  isUuid,
  jsonError,
  numberValue,
  phaseValue,
  readJsonObject,
  stringValue
} from "@/lib/api/validation";
import { calculateOpportunityScore } from "@/lib/score";
import type { Opportunity, RiskAssessment } from "@/types";

type Params = {
  params: {
    id: string;
  };
};

function sanitizeOpportunityPatch(body: Record<string, unknown>, current: Opportunity) {
  const patch: Partial<Opportunity> = {};

  if ("name" in body) patch.name = stringValue(body.name, current.name) || current.name;
  if ("urgency" in body) patch.urgency = numberValue(body.urgency, current.urgency, 1, 10);
  if ("pain" in body) patch.pain = numberValue(body.pain, current.pain, 1, 10);
  if ("frequency" in body) patch.frequency = numberValue(body.frequency, current.frequency, 1, 10);
  if ("willingness_to_pay" in body) patch.willingness_to_pay = numberValue(body.willingness_to_pay, current.willingness_to_pay, 1, 10);
  if ("domain_expertise" in body) patch.domain_expertise = numberValue(body.domain_expertise, current.domain_expertise, 1, 10);
  if ("network_access" in body) patch.network_access = numberValue(body.network_access, current.network_access, 1, 10);
  if ("unfair_insight" in body) patch.unfair_insight = numberValue(body.unfair_insight, current.unfair_insight, 1, 10);
  if ("timing_signals" in body) patch.timing_signals = arrayOfStrings(body.timing_signals);
  if ("business_model" in body) patch.business_model = stringValue(body.business_model, current.business_model);
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
            threat: heatLevelValue(competitor.threat, "medium")
          }))
      : current.competitors;
  }
  if ("moat_network" in body) patch.moat_network = numberValue(body.moat_network, current.moat_network, 1, 10);
  if ("moat_data" in body) patch.moat_data = numberValue(body.moat_data, current.moat_data, 1, 10);
  if ("moat_switching" in body) patch.moat_switching = numberValue(body.moat_switching, current.moat_switching, 1, 10);
  if ("moat_scale" in body) patch.moat_scale = numberValue(body.moat_scale, current.moat_scale, 1, 10);
  if ("moat_brand" in body) patch.moat_brand = numberValue(body.moat_brand, current.moat_brand, 1, 10);
  if ("moat_ip" in body) patch.moat_ip = numberValue(body.moat_ip, current.moat_ip, 1, 10);
  if ("phase" in body) patch.phase = phaseValue(body.phase, current.phase);
  if ("kpi_primary" in body) patch.kpi_primary = stringValue(body.kpi_primary, current.kpi_primary);
  if ("kpi_revenue" in body) patch.kpi_revenue = stringValue(body.kpi_revenue, current.kpi_revenue);
  if ("kpi_learning" in body) patch.kpi_learning = stringValue(body.kpi_learning, current.kpi_learning);
  if ("conviction_stars" in body) patch.conviction_stars = numberValue(body.conviction_stars, current.conviction_stars, 0, 5);

  return patch;
}

export async function GET(_request: Request, { params }: Params) {
  if (!isUuid(params.id)) {
    return jsonError("Invalid opportunity id.", 400);
  }

  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const [{ data: opportunity, error }, notes, risks, tasks, documents, messages] = await Promise.all([
    supabase.from("opportunities").select("*").eq("id", params.id).eq("user_id", user.id).single(),
    supabase.from("opportunity_notes").select("*").eq("opportunity_id", params.id).eq("user_id", user.id).maybeSingle(),
    supabase.from("risk_assessments").select("*").eq("opportunity_id", params.id).eq("user_id", user.id).order("created_at"),
    supabase.from("tasks").select("*").eq("opportunity_id", params.id).eq("user_id", user.id).order("created_at"),
    supabase.from("documents").select("*").eq("opportunity_id", params.id).eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("ember_messages").select("*").eq("opportunity_id", params.id).eq("user_id", user.id).order("created_at")
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({
    opportunity,
    notes: notes.data,
    risks: risks.data ?? [],
    tasks: tasks.data ?? [],
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
    .eq("user_id", user.id)
    .single();

  if (currentError || !currentOpportunity) {
    return NextResponse.json({ error: currentError?.message ?? "Opportunity not found" }, { status: 404 });
  }

  const opportunityPatch = sanitizeOpportunityPatch(body, currentOpportunity);

  const notes = body.notes;
  if (notes) {
    if (typeof notes !== "object" || Array.isArray(notes)) {
      return jsonError("Notes must be an object.");
    }

    const { error } = await supabase.from("opportunity_notes").upsert({
      opportunity_id: params.id,
      user_id: user.id,
      thesis: stringValue((notes as Record<string, unknown>).thesis),
      customer_notes: stringValue((notes as Record<string, unknown>).customer_notes),
      open_questions: stringValue((notes as Record<string, unknown>).open_questions),
      kill_conditions: stringValue((notes as Record<string, unknown>).kill_conditions),
      moat_insight: stringValue((notes as Record<string, unknown>).moat_insight)
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  let nextRisks: Pick<RiskAssessment, "heat_level">[] | null = null;
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
          mitigation_note: stringValue(risk.mitigation_note)
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

  const [{ data: latestRisks }, { data: tasks }] = await Promise.all([
    nextRisks ? Promise.resolve({ data: nextRisks }) : supabase.from("risk_assessments").select("heat_level").eq("opportunity_id", params.id).eq("user_id", user.id),
    supabase.from("tasks").select("done").eq("opportunity_id", params.id).eq("user_id", user.id)
  ]);

  const score = calculateOpportunityScore({ ...currentOpportunity, ...opportunityPatch }, latestRisks ?? [], tasks ?? []);

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
