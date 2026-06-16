import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { isUuid, jsonError, readJsonObject, stringValue } from "@/lib/api/validation";
import { emberSectionFields, extractJsonPayloads, filterPatchForSection, normalizeEmberFieldPatch, normalizeEmberSection } from "@/lib/ember/fieldUpdates";
import { getOpenAIHeaders, EMBER_MODEL, RESPONSES_API_URL } from "@/lib/openai/client";
import { buildOpportunityContext } from "@/lib/openai/context";
import { sectionFillPrompt } from "@/lib/openai/agents/autofill";
import type { Opportunity } from "@/types";

type ResponseContent = { text?: string };
type ResponseOutput = { content?: ResponseContent[] };

function extractText(payload: { output_text?: unknown; output?: ResponseOutput[] }) {
  if (typeof payload.output_text === "string") return payload.output_text;
  const output = Array.isArray(payload.output) ? payload.output : [];
  return output
    .flatMap((item: ResponseOutput) => (Array.isArray(item.content) ? item.content : []))
    .map((content: ResponseContent) => content.text)
    .filter(Boolean)
    .join("");
}

function isBlank(value: unknown) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function opportunityFieldsFromBody(body: Record<string, unknown>, opportunity: Opportunity) {
  const fields = new Set<string>();
  const fieldKey = stringValue(body.fieldKey);
  if (fieldKey) fields.add(fieldKey);
  if (Array.isArray(body.allowedFields)) {
    body.allowedFields.map((field) => stringValue(field)).filter(Boolean).forEach((field) => fields.add(field));
  }
  return [...fields].filter((field): field is keyof Opportunity => field in opportunity);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { body, response: bodyResponse } = await readJsonObject(request);
  if (bodyResponse) return bodyResponse;

  const opportunityId = body.opportunityId;
  const action = stringValue(body.action);

  if (!isUuid(opportunityId) || !["create_action_plan", "fill_section", "fill_field", "fill_fields"].includes(action)) {
    return jsonError("Invalid Ember action request.");
  }

  const [{ data: opportunity, error }, notes, risks, loadedTasks, milestones, documents] = await Promise.all([
    supabase.from("opportunities").select("*").eq("id", opportunityId).eq("user_id", user.id).single(),
    supabase.from("opportunity_notes").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id).maybeSingle(),
    supabase.from("risk_assessments").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id),
    supabase.from("tasks").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id),
    supabase.from("milestones").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id),
    supabase.from("documents").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id)
  ]);

  if (error || !opportunity) {
    return jsonError("Opportunity not found.", 404);
  }

  if (action === "fill_section" || action === "fill_field" || action === "fill_fields") {
    const section = action === "fill_section" ? normalizeEmberSection(body.section ?? body.tab) : null;
    const targetFields = section ? emberSectionFields[section].opportunity : opportunityFieldsFromBody(body, opportunity as Opportunity);
    const targetNotes = section ? emberSectionFields[section].notes : [];
    const targetCollections = section ? emberSectionFields[section].collections : [];
    if (targetFields.length === 0 && targetNotes.length === 0 && targetCollections.length === 0) {
      return jsonError("No valid Ember fields requested.");
    }
    const targetLabel = section ?? "targeted fields";
    const fillBlanksOnly = body.fillBlanksOnly !== false;
    const intent = stringValue(body.intent, action === "fill_field" ? "Improve this single field with a sharper replacement." : "Fill missing fields with a conservative cofounder-quality first pass.");
    const allowedFields = [
      ...targetFields.map((field) => `opportunity.${field}`),
      ...targetNotes.map((field) => `notes.${field}`),
      ...targetCollections
    ];
    const extraContext = stringValue(body.context);
    const context = buildOpportunityContext({
      opportunity,
      notes: notes.data,
      risks: risks.data ?? [],
      tasks: loadedTasks.data ?? [],
      documents: documents.data ?? [],
      extra: [`Only fill ${targetLabel}. Existing milestones: ${JSON.stringify(milestones.data ?? [])}`, extraContext].filter(Boolean).join("\n\n")
    });

    const upstream = await fetch(RESPONSES_API_URL, {
      method: "POST",
      headers: getOpenAIHeaders(),
      body: JSON.stringify({
        model: EMBER_MODEL,
        instructions: sectionFillPrompt(targetLabel, allowedFields, intent),
        input: `Return JSON updates only for ${targetLabel} based on this context:\n${context}`,
        max_output_tokens: 3200
      }),
      signal: AbortSignal.timeout(10_000)
    }).catch((openAiError) => {
      console.error("OpenAI section fill failed", openAiError);
      return null;
    });

    if (!upstream?.ok) {
      return NextResponse.json({ error: "Ember section fill is unavailable right now." }, { status: 502 });
    }

    const payload = await upstream.json();
    const text = extractText(payload);
    const [fill] = extractJsonPayloads(text);
    if (!fill) {
      console.error("Ember returned invalid section JSON", text);
      return NextResponse.json({ error: "Ember returned invalid section JSON." }, { status: 502 });
    }
    let normalizedFill = section ? filterPatchForSection(normalizeEmberFieldPatch(fill), section) : normalizeEmberFieldPatch(fill);
    if (!section) {
      normalizedFill = {
        ...normalizedFill,
        opportunity: Object.fromEntries(Object.entries(normalizedFill.opportunity).filter(([key]) => targetFields.includes(key as keyof Opportunity))),
        notes: {}
      };
    }
    if (fillBlanksOnly) {
      normalizedFill = {
        ...normalizedFill,
        opportunity: Object.fromEntries(Object.entries(normalizedFill.opportunity).filter(([key]) => isBlank((opportunity as Record<string, unknown>)[key]))),
        notes: Object.fromEntries(Object.entries(normalizedFill.notes).filter(([key]) => isBlank((notes.data as Record<string, unknown> | null)?.[key])))
      };
    }
    const existingTaskTexts = new Set((loadedTasks.data ?? []).map((task) => String(task.text ?? "").trim().toLowerCase()).filter(Boolean));
    const newTasks = (normalizedFill.tasks ?? []).filter((task) => {
      const text = String(task.text ?? "").trim().toLowerCase();
      if (!text || existingTaskTexts.has(text)) return false;
      existingTaskTexts.add(text);
      return true;
    });
    const insertedTasks = newTasks.length
      ? await supabase
          .from("tasks")
          .insert(
            newTasks.map((task) => ({
              opportunity_id: opportunityId,
              user_id: user.id,
              text: task.text ?? "Untitled task",
              category: task.category ?? "research",
              phase: task.phase ?? opportunity.phase,
              priority: task.priority ?? "medium",
              due_date: task.due_date ?? null,
              done: Boolean(task.done)
            }))
          )
          .select("*")
      : { data: [], error: null };

    if (insertedTasks.error) {
      return NextResponse.json({ error: insertedTasks.error.message }, { status: 500 });
    }
    await supabase.from("ember_messages").insert({
      opportunity_id: opportunityId,
      user_id: user.id,
      role: "assistant",
      content: `I filled a starting point for ${targetLabel}. Review every field before relying on it.`,
      agent_type: "core"
    });
    return NextResponse.json({ fill: normalizedFill, tasks: insertedTasks.data ?? [] });
  }

  const actionTasks = [
    {
      opportunity_id: opportunityId,
      user_id: user.id,
      text: `Interview 5 target customers about ${opportunity.name}`,
      category: "research",
      phase: opportunity.phase,
      priority: "high"
    },
    {
      opportunity_id: opportunityId,
      user_id: user.id,
      text: "Define the smallest proof-of-value prototype",
      category: "product",
      phase: opportunity.phase,
      priority: "medium"
    },
    {
      opportunity_id: opportunityId,
      user_id: user.id,
      text: "Ask 3 prospects for paid pilot terms",
      category: "sales",
      phase: opportunity.phase,
      priority: "high"
    },
    {
      opportunity_id: opportunityId,
      user_id: user.id,
      text: "Review risks and choose one mitigation experiment",
      category: "ops",
      phase: opportunity.phase,
      priority: "medium"
    }
  ];

  const { data, error: insertError } = await supabase.from("tasks").insert(actionTasks).select("*");
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase.from("ember_messages").insert({
    opportunity_id: opportunityId,
    user_id: user.id,
    role: "assistant",
    content: "I created a starter action plan from the current whiteboard. Review the tasks, adjust priorities and dates, then execute the highest-risk validation first.",
    agent_type: "execution"
  });

  return NextResponse.json({ tasks: data ?? [] }, { status: 201 });
}

