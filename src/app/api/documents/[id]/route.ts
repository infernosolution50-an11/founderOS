import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { isUuid, jsonError } from "@/lib/api/validation";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: Params) {
  if (!isUuid(params.id)) {
    return jsonError("Invalid document id.");
  }

  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { data: document, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !document) {
    return jsonError("Document not found.", 404);
  }

  const signed = await supabase.storage.from("documents").createSignedUrl(document.storage_path, 60);
  if (signed.error) {
    return NextResponse.json({ error: signed.error.message }, { status: 500 });
  }

  return NextResponse.json({ url: signed.data.signedUrl, document });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!isUuid(params.id)) {
    return jsonError("Invalid document id.");
  }

  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { data: document, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !document) {
    return jsonError("Document not found.", 404);
  }

  const storage = await supabase.storage.from("documents").remove([document.storage_path]);
  if (storage.error) {
    console.error("Failed to remove document storage object", storage.error);
  }

  const deleted = await supabase.from("documents").delete().eq("id", params.id).eq("user_id", user.id);
  if (deleted.error) {
    return NextResponse.json({ error: deleted.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

