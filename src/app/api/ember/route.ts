import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { buildOpportunityContext, normalizeAgentType } from "@/lib/openai/context";
import { getOpenAIHeaders, EMBER_MODEL, RESPONSES_API_URL } from "@/lib/openai/client";
import { selectAgentPrompt } from "@/lib/openai/agents";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const agentType = normalizeAgentType(body.agentType);

  if (!body.message || !body.opportunityId) {
    return NextResponse.json({ error: "Missing message or opportunityId" }, { status: 400 });
  }

  const [{ data: opportunity, error }, notes, risks, tasks, documents] = await Promise.all([
    supabase.from("opportunities").select("*").eq("id", body.opportunityId).eq("user_id", user.id).single(),
    supabase.from("opportunity_notes").select("*").eq("opportunity_id", body.opportunityId).eq("user_id", user.id).maybeSingle(),
    supabase.from("risk_assessments").select("*").eq("opportunity_id", body.opportunityId).eq("user_id", user.id),
    supabase.from("tasks").select("*").eq("opportunity_id", body.opportunityId).eq("user_id", user.id),
    supabase.from("documents").select("*").eq("opportunity_id", body.opportunityId).eq("user_id", user.id)
  ]);

  if (error || !opportunity) {
    return NextResponse.json({ error: error?.message ?? "Opportunity not found" }, { status: 404 });
  }

  await supabase.from("ember_messages").insert({
    opportunity_id: body.opportunityId,
    user_id: user.id,
    role: "user",
    content: body.message,
    agent_type: agentType
  });

  const context = buildOpportunityContext({
    opportunity,
    notes: notes.data,
    risks: risks.data ?? [],
    tasks: tasks.data ?? [],
    documents: documents.data ?? [],
    extra: body.extraContext
  });

  const upstream = await fetch(RESPONSES_API_URL, {
    method: "POST",
    headers: getOpenAIHeaders(),
    body: JSON.stringify({
      model: EMBER_MODEL,
      instructions: selectAgentPrompt(agentType, context),
      input: body.message,
      stream: true,
      max_output_tokens: 1500,
      ...(body.previousResponseId ? { previous_response_id: body.previousResponseId } : {})
    })
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text();
    return NextResponse.json({ error: "OpenAI Responses API failed", detail }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let assistantContent = "";
  let responseId: string | undefined;
  let buffer = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            const dataLine = event.split("\n").find((line) => line.startsWith("data: "));
            if (!dataLine) continue;

            const raw = dataLine.slice(6).trim();
            if (raw === "[DONE]") continue;

            const payload = JSON.parse(raw);
            if (payload.type === "response.created") {
              responseId = payload.response?.id;
            }
            if (payload.type === "response.output_text.delta") {
              const text = payload.delta ?? "";
              assistantContent += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "delta", text })}\n\n`));
            }
            if (payload.type === "response.completed") {
              responseId = payload.response?.id ?? responseId;
            }
          }
        }

        await supabase.from("ember_messages").insert({
          opportunity_id: body.opportunityId,
          user_id: user.id,
          role: "assistant",
          content: assistantContent,
          agent_type: agentType
        });

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", responseId })}\n\n`));
        controller.close();
      } catch (streamError) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: streamError instanceof Error ? streamError.message : "Stream failed"
            })}\n\n`
          )
        );
        controller.close();
      }
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
