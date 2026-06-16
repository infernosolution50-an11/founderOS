import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { jsonError, readJsonObject, stringValue } from "@/lib/api/validation";
import { extractJsonPayloads, normalizeEmberFieldPatch } from "@/lib/ember/fieldUpdates";
import { fallbackAutofillPatch } from "@/lib/ember/fallback";
import { getOpenAIHeaders, EMBER_MODEL, RESPONSES_API_URL } from "@/lib/openai/client";
import { autofillPrompt } from "@/lib/openai/agents/autofill";

export const runtime = "nodejs";

type ResponseContent = { text?: string };
type ResponseOutput = { content?: ResponseContent[] };

function extractText(payload: { output_text?: unknown; output?: ResponseOutput[] }) {
  if (typeof payload.output_text === "string") return payload.output_text;
  const output = Array.isArray(payload.output) ? payload.output : [];
  return output
    .flatMap((item: ResponseOutput) => (Array.isArray(item.content) ? item.content : []))
    .map((content: ResponseContent) => content.text)
    .filter(Boolean)
    .join("");
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const limited = checkRateLimit(`ember-autofill:${user.id}`, 12, 10 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many autofill requests. Try again shortly." }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  }

  const { body, response: bodyResponse } = await readJsonObject(request);
  if (bodyResponse) return bodyResponse;

  const idea = stringValue(body.idea ?? body.description);
  const opportunityName = stringValue(body.opportunityName);
  if (!idea) {
    return jsonError("Idea description is required.");
  }

  let upstream: Response;
  try {
    upstream = await fetch(RESPONSES_API_URL, {
      method: "POST",
      headers: getOpenAIHeaders(),
      body: JSON.stringify({
        model: EMBER_MODEL,
        instructions: autofillPrompt(),
        input: JSON.stringify({ opportunityName, idea }),
        max_output_tokens: 5000
      }),
      signal: AbortSignal.timeout(8_000)
    });
  } catch (error) {
    console.error("OpenAI autofill request failed", error);
    return NextResponse.json({ autofill: fallbackAutofillPatch(opportunityName, idea), fallback: true });
  }

  if (!upstream.ok) {
    console.error("OpenAI autofill failed", await upstream.text().catch(() => ""));
    return NextResponse.json({ autofill: fallbackAutofillPatch(opportunityName, idea), fallback: true });
  }

  const payload = await upstream.json();
  const text = extractText(payload);
  const [autofill] = extractJsonPayloads(text);
  if (!autofill) {
    console.error("Ember returned invalid autofill JSON", text);
    return NextResponse.json({ autofill: fallbackAutofillPatch(opportunityName, idea), fallback: true });
  }
  return NextResponse.json({ autofill: normalizeEmberFieldPatch(autofill) });
}

