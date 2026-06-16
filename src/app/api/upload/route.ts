import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { isUuid, jsonError } from "@/lib/api/validation";
import { extractTextFromDocument, supportedDocumentTypes } from "@/lib/extractText";

export const runtime = "nodejs";

const maxFileSize = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const limited = checkRateLimit(`upload:${user.id}`, 12, 60 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return jsonError("Invalid upload request.");
  }

  const file = formData.get("file");
  const opportunityId = formData.get("opportunityId");

  if (!(file instanceof File) || !isUuid(opportunityId)) {
    return NextResponse.json({ error: "Missing file or opportunityId" }, { status: 400 });
  }

  if (!supportedDocumentTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF and DOCX files are supported" }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ error: "File must be 10MB or less" }, { status: 400 });
  }

  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", opportunityId)
    .eq("user_id", user.id)
    .single();

  if (opportunityError || !opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${user.id}/${opportunityId}/${Date.now()}-${safeName}`;

  const upload = await supabase.storage.from("documents").upload(storagePath, buffer, {
    contentType: file.type,
    upsert: false
  });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 500 });
  }

  let extractedText = "";
  try {
    extractedText = await extractTextFromDocument(buffer, file.type);
  } catch (extractError) {
    await supabase.storage.from("documents").remove([storagePath]);
    console.error("Document text extraction failed", extractError);
    return NextResponse.json({ error: "Could not read text from this document." }, { status: 400 });
  }

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .insert({
      opportunity_id: opportunityId,
      user_id: user.id,
      filename: file.name,
      storage_path: storagePath,
      extracted_text: extractedText,
      file_type: file.type,
      file_size_bytes: file.size
    })
    .select("*")
    .single();

  if (documentError) {
    await supabase.storage.from("documents").remove([storagePath]);
    return NextResponse.json({ error: documentError.message }, { status: 500 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", document })}\n\n`));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
