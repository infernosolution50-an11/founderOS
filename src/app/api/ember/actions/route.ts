import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { isUuid, jsonError, readJsonObject, stringValue } from "@/lib/api/validation";

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { body, response: bodyResponse } = await readJsonObject(request);
  if (bodyResponse) return bodyResponse;

  const opportunityId = body.opportunityId;
  const action = stringValue(body.action);

  if (!isUuid(opportunityId) || action !== "create_action_plan") {
    return jsonError("Invalid Ember action request.");
  }

  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", opportunityId)
    .eq("user_id", user.id)
    .single();

  if (error || !opportunity) {
    return jsonError("Opportunity not found.", 404);
  }

  const tasks = [
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

  const { data, error: insertError } = await supabase.from("tasks").insert(tasks).select("*");
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

