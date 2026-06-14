import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";

export async function GET() {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ opportunities: data });
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      user_id: user.id,
      name: body.name || "Untitled Opportunity"
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("opportunity_notes").insert({
    opportunity_id: data.id,
    user_id: user.id
  });

  return NextResponse.json({ opportunity: data }, { status: 201 });
}
