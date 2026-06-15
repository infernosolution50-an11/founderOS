import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { isUuid, jsonError, readJsonObject, stringValue } from "@/lib/api/validation";
import { buildOpportunityContext, normalizeAgentType } from "@/lib/openai/context";
import { getOpenAIHeaders, EMBER_MODEL, RESPONSES_API_URL } from "@/lib/openai/client";
import { selectAgentPrompt } from "@/lib/openai/agents";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const limited = checkRateLimit(`ember:${user.id}`, 30, 10 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many Ember requests. Try again shortly." }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  }

  const { body, response: bodyResponse } = await readJsonObject(request);
  if (bodyResponse) return bodyResponse;

  const agentType = normalizeAgentType(body.agentType);
  const message = stringValue(body.message);
  const opportunityId = body.opportunityId;

  if (!message || !isUuid(opportunityId)) {
    return jsonError("Missing message or opportunityId.");
  }

  const [{ data: opportunity, error }, notes, risks, tasks, documents] = await Promise.all([
    supabase.from("opportunities").select("*").eq("id", opportunityId).eq("user_id", user.id).single(),
    supabase.from("opportunity_notes").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id).maybeSingle(),
    supabase.from("risk_assessments").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id),
    supabase.from("tasks").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id),
    supabase.from("documents").select("*").eq("opportunity_id", opportunityId).eq("user_id", user.id)
  ]);

  if (error || !opportunity) {
    return NextResponse.json({ error: error?.message ?? "Opportunity not found" }, { status: 404 });
  }

  await supabase.from("ember_messages").insert({
    opportunity_id: opportunityId,
    user_id: user.id,
    role: "user",
    content: message,
    agent_type: agentType
  });

  const context = buildOpportunityContext({
    opportunity,
    notes: notes.data,
    risks: risks.data ?? [],
    tasks: tasks.data ?? [],
    documents: documents.data ?? [],
    extra: stringValue(body.extraContext)
  });

  let upstream: Response;
  try {
    upstream = await fetch(RESPONSES_API_URL, {
      method: "POST",
      headers: getOpenAIHeaders(),
      body: JSON.stringify({
        model: EMBER_MODEL,
        instructions: selectAgentPrompt(agentType, context),
        input: message,
        stream: true,
        max_output_tokens: 1500,
        ...(typeof body.previousResponseId === "string" ? { previous_response_id: body.previousResponseId } : {})
      })
    });
  } catch (openAiError) {
    console.error("OpenAI request failed", openAiError);
    return NextResponse.json({ error: "Ember is unavailable right now." }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    console.error("OpenAI Responses API failed", await upstream.text().catch(() => ""));
    return NextResponse.json({ error: "Ember is unavailable right now." }, { status: 502 });
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
          opportunity_id: opportunityId,
          user_id: user.id,
          role: "assistant",
          content: assistantContent,
          agent_type: agentType,
          response_id: responseId ?? null
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
