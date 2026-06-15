import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { isUuid, jsonError, nullableDateValue, phaseValue, priorityValue, readJsonObject, stringValue, taskCategoryValue } from "@/lib/api/validation";
import { recalculateOpportunityScore } from "@/lib/api/recalculateScore";

export async function GET(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const opportunityId = searchParams.get("opportunityId");

  if (!isUuid(opportunityId)) {
    return jsonError("Missing or invalid opportunityId.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("opportunity_id", opportunityId)
    .eq("user_id", user.id)
    .order("created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data });
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { body, response: bodyResponse } = await readJsonObject(request);
  if (bodyResponse) return bodyResponse;

  const opportunityId = body.opportunityId;
  if (!isUuid(opportunityId)) {
    return jsonError("Missing or invalid opportunityId.");
  }

  const text = stringValue(body.text);
  if (!text) {
    return jsonError("Task text is required.");
  }

  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunities")
    .select("id")
    .eq("id", opportunityId)
    .eq("user_id", user.id)
    .single();

  if (opportunityError || !opportunity) {
    return jsonError("Opportunity not found.", 404);
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      opportunity_id: opportunityId,
      user_id: user.id,
      text,
      category: taskCategoryValue(body.category),
      phase: phaseValue(body.phase),
      priority: priorityValue(body.priority),
      due_date: nullableDateValue(body.due_date)
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await recalculateOpportunityScore(supabase as any, opportunityId, user.id);

  return NextResponse.json({ task: data }, { status: 201 });
}
