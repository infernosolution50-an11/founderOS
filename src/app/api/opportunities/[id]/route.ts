import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: Params) {
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
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const { notes, risks, ...opportunityPatch } = body;

  if (Object.keys(opportunityPatch).length > 0) {
    const { error } = await supabase
      .from("opportunities")
      .update(opportunityPatch)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (notes) {
    const { error } = await supabase.from("opportunity_notes").upsert({
      ...notes,
      opportunity_id: params.id,
      user_id: user.id
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (Array.isArray(risks)) {
    const deleteResult = await supabase.from("risk_assessments").delete().eq("opportunity_id", params.id).eq("user_id", user.id);
    if (deleteResult.error) {
      return NextResponse.json({ error: deleteResult.error.message }, { status: 500 });
    }

    if (risks.length > 0) {
      const insertResult = await supabase.from("risk_assessments").insert(
        risks.map((risk) => ({
          opportunity_id: params.id,
          user_id: user.id,
          risk_label: risk.risk_label,
          heat_level: risk.heat_level,
          mitigation_note: risk.mitigation_note || ""
        }))
      );

      if (insertResult.error) {
        return NextResponse.json({ error: insertResult.error.message }, { status: 500 });
      }
    }
  }

  const { data, error } = await supabase.from("opportunities").select("*").eq("id", params.id).eq("user_id", user.id).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ opportunity: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { error } = await supabase.from("opportunities").delete().eq("id", params.id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
