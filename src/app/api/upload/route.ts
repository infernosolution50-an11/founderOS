import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { extractTextFromDocument, supportedDocumentTypes } from "@/lib/extractText";
import { buildOpportunityContext } from "@/lib/openai/context";
import { getOpenAIHeaders, EMBER_MODEL, RESPONSES_API_URL } from "@/lib/openai/client";
import { selectAgentPrompt } from "@/lib/openai/agents";

export const runtime = "nodejs";

const maxFileSize = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const formData = await request.formData();
  const file = formData.get("file");
  const opportunityId = formData.get("opportunityId");

  if (!(file instanceof File) || typeof opportunityId !== "string") {
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

  const extractedText = await extractTextFromDocument(buffer, file.type);

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

  const upstream = await fetch(RESPONSES_API_URL, {
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

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "OpenAI Responses API failed", document }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let assistantContent = "";
  let responseId: string | undefined;
  let bufferText = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();

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

      await supabase.from("ember_messages").insert({
        opportunity_id: opportunityId,
        user_id: user.id,
        role: "assistant",
        content: assistantContent,
        agent_type: "doc_synthesizer"
      });

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
