import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";

export async function GET(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const opportunityId = searchParams.get("opportunityId");

  if (!opportunityId) {
    return NextResponse.json({ error: "Missing opportunityId" }, { status: 400 });
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

  const body = await request.json();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      opportunity_id: body.opportunityId,
      user_id: user.id,
      text: body.text,
      category: body.category,
      phase: body.phase || "0→1",
      priority: body.priority || "medium",
      due_date: body.due_date || null
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data }, { status: 201 });
}
