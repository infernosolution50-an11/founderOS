import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const { data, error } = await supabase
    .from("tasks")
    .update(body)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { error } = await supabase.from("tasks").delete().eq("id", params.id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
