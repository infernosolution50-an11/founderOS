import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { isUuid, jsonError } from "@/lib/api/validation";
import { extractJsonPayloads, normalizeEmberFieldPatch } from "@/lib/ember/fieldUpdates";
import { extractTextFromDocument, supportedDocumentTypes } from "@/lib/extractText";
import { buildOpportunityContext } from "@/lib/openai/context";
import { getOpenAIHeaders, EMBER_MODEL, RESPONSES_API_URL } from "@/lib/openai/client";
import { selectAgentPrompt } from "@/lib/openai/agents";

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

  const [{ data: notes }, { data: risks }, { data: tasks }, { data: documents }] = await Promise.all([
    supabase.from("opportunity_notes").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id).maybeSingle(),
    supabase.from("risk_assessments").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id),
    supabase.from("tasks").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id),
    supabase.from("documents").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id)
  ]);

  const message = `Synthesize uploaded document: ${file.name}`;
  await supabase.from("ember_messages").insert({
    opportunity_id: opportunityId,
    user_id: user.id,
    role: "user",
    content: message,
    agent_type: "doc_synthesizer"
  });

  const context = buildOpportunityContext({
    opportunity,
    notes,
    risks: risks ?? [],
    tasks: tasks ?? [],
    documents: documents ?? [],
    extra: `Uploaded document text from ${file.name}:\n${extractedText.slice(0, 30000)}`
  });

  let upstream: Response;
  try {
    upstream = await fetch(RESPONSES_API_URL, {
      method: "POST",
      headers: getOpenAIHeaders(),
      body: JSON.stringify({
        model: EMBER_MODEL,
        instructions: selectAgentPrompt("doc_synthesizer", context),
        input: message,
        stream: true,
        max_output_tokens: 1500
      })
    });
  } catch (openAiError) {
    console.error("Document synthesis request failed", openAiError);
    return NextResponse.json({ error: "Document uploaded, but Ember synthesis is unavailable.", document }, { status: 202 });
  }

  if (!upstream.ok || !upstream.body) {
    console.error("Document synthesis failed", await upstream.text().catch(() => ""));
    return NextResponse.json({ error: "Document uploaded, but Ember synthesis is unavailable.", document }, { status: 202 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let assistantContent = "";
  let responseId: string | undefined;
  let bufferText = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          bufferText += decoder.decode(value, { stream: true });
          const events = bufferText.split("\n\n");
          bufferText = events.pop() ?? "";

          for (const event of events) {
            const dataLine = event.split("\n").find((line) => line.startsWith("data: "));
            if (!dataLine) continue;
            const raw = dataLine.slice(6).trim();
            if (raw === "[DONE]") continue;
            const payload = JSON.parse(raw);

            if (payload.type === "response.created") responseId = payload.response?.id;
            if (payload.type === "response.output_text.delta") {
              const text = payload.delta ?? "";
              assistantContent += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "delta", text, document })}\n\n`));
            }
            if (payload.type === "response.completed") responseId = payload.response?.id ?? responseId;
          }
        }
      } catch (streamError) {
        console.error("Document synthesis stream failed", streamError);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: "Document synthesis failed.", document })}\n\n`));
      }

      await supabase.from("ember_messages").insert({
        opportunity_id: opportunityId,
        user_id: user.id,
        role: "assistant",
        content: assistantContent,
        agent_type: "doc_synthesizer",
        response_id: responseId ?? null
      });

      const [fieldUpdates] = extractJsonPayloads(assistantContent);
      if (fieldUpdates) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "field_updates", payload: normalizeEmberFieldPatch(fieldUpdates), document })}\n\n`));
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", responseId, document })}\n\n`));
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
