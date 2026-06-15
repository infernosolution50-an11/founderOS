import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { isUuid, jsonError, readJsonObject, stringValue } from "@/lib/api/validation";
import { getOpenAIHeaders, EMBER_MODEL, RESPONSES_API_URL } from "@/lib/openai/client";
import { buildOpportunityContext } from "@/lib/openai/context";
import { autofillPrompt } from "@/lib/openai/agents/autofill";

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

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { body, response: bodyResponse } = await readJsonObject(request);
  if (bodyResponse) return bodyResponse;

  const opportunityId = body.opportunityId;
  const action = stringValue(body.action);

  if (!isUuid(opportunityId) || !["create_action_plan", "fill_section"].includes(action)) {
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

  if (action === "fill_section") {
    const section = stringValue(body.section ?? body.tab, "Research");
    const context = buildOpportunityContext({
      opportunity,
      notes: notes.data,
      risks: risks.data ?? [],
      tasks: loadedTasks.data ?? [],
      documents: documents.data ?? [],
      extra: `Only fill the ${section} section. Existing milestones: ${JSON.stringify(milestones.data ?? [])}`
    });

    const upstream = await fetch(RESPONSES_API_URL, {
      method: "POST",
      headers: getOpenAIHeaders(),
      body: JSON.stringify({
        model: EMBER_MODEL,
        instructions: autofillPrompt(),
        input: `Return JSON updates only for the ${section} section based on this context:\n${context}`,
        max_output_tokens: 1800
      })
    }).catch((openAiError) => {
      console.error("OpenAI section fill failed", openAiError);
      return null;
    });

    if (!upstream?.ok) {
      return NextResponse.json({ error: "Ember section fill is unavailable right now." }, { status: 502 });
    }

    const payload = await upstream.json();
    const text = extractText(payload);
    try {
      const fill = JSON.parse(text);
      await supabase.from("ember_messages").insert({
        opportunity_id: opportunityId,
        user_id: user.id,
        role: "assistant",
        content: `I filled a starting point for the ${section} section. Review every field before relying on it.`,
        agent_type: "core"
      });
      return NextResponse.json({ fill });
    } catch {
      return NextResponse.json({ error: "Ember returned invalid section JSON." }, { status: 502 });
    }
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

