import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { isUuid, jsonError, nullableDateValue, phaseValue, priorityValue, readJsonObject, stringValue, taskCategoryValue } from "@/lib/api/validation";

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  if (!isUuid(params.id)) {
    return jsonError("Invalid task id.");
  }

  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { body, response: bodyResponse } = await readJsonObject(request);
  if (bodyResponse) return bodyResponse;

  const patch: Record<string, unknown> = {};
  if ("text" in body) {
    const text = stringValue(body.text);
    if (!text) return jsonError("Task text cannot be empty.");
    patch.text = text;
  }
  if ("category" in body) patch.category = taskCategoryValue(body.category);
  if ("phase" in body) patch.phase = phaseValue(body.phase);
  if ("done" in body) patch.done = Boolean(body.done);
  if ("priority" in body) patch.priority = priorityValue(body.priority);
  if ("due_date" in body) patch.due_date = nullableDateValue(body.due_date);

  if (Object.keys(patch).length === 0) {
    return jsonError("No editable task fields provided.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
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
  if (!isUuid(params.id)) {
    return jsonError("Invalid task id.");
  }

  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { error } = await supabase.from("tasks").delete().eq("id", params.id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
