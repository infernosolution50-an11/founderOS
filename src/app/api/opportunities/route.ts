import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { arrayOfStrings, jsonError, numberValue, readJsonObject, stringValue } from "@/lib/api/validation";
import { calculateOpportunityScore } from "@/lib/score";

export async function GET() {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ opportunities: data });
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const { body, response: bodyResponse } = await readJsonObject(request);
  if (bodyResponse) return bodyResponse;

  const isExample = Boolean(body.example);
  const opportunitySeed = isExample
    ? {
        name: "AI procurement copilot for mid-market finance teams",
        urgency: 8,
        pain: 8,
        frequency: 7,
        willingness_to_pay: 8,
        domain_expertise: 4,
        network_access: 4,
        unfair_insight: 5,
        timing_signals: ["New technology", "Behavior shift"],
        business_model: "Vertical SaaS",
        acv: "$18k/year",
        tam_m: 2200,
        sam_m: 360,
        som_m: 42,
        growth_rate_pct: 32,
        competitors: [
          { name: "Zip", threat: "high" },
          { name: "Coupa", threat: "medium" },
          { name: "Manual spreadsheet workflow", threat: "high" }
        ],
        moat_network: 5,
        moat_data: 7,
        moat_switching: 6,
        moat_scale: 4,
        moat_brand: 3,
        moat_ip: 2,
        phase: "0→1",
        kpi_primary: "10 finance leader discovery calls",
        kpi_revenue: "3 paid pilots at $1.5k/month",
        kpi_learning: "Validate whether procurement intake is owned by finance or ops",
        conviction_stars: 4,
        opportunity_score: 72
      }
    : {
        name: stringValue(body.name, "Untitled Opportunity") || "Untitled Opportunity"
      };

  const opportunityScore = calculateOpportunityScore({
    urgency: numberValue(opportunitySeed.urgency, 5, 1, 10),
    pain: numberValue(opportunitySeed.pain, 5, 1, 10),
    frequency: numberValue(opportunitySeed.frequency, 5, 1, 10),
    willingness_to_pay: numberValue(opportunitySeed.willingness_to_pay, 5, 1, 10),
    tam_m: numberValue(opportunitySeed.tam_m, 0, 0),
    growth_rate_pct: numberValue(opportunitySeed.growth_rate_pct, 20, 0),
    domain_expertise: numberValue(opportunitySeed.domain_expertise, 3, 1, 10),
    network_access: numberValue(opportunitySeed.network_access, 3, 1, 10),
    unfair_insight: numberValue(opportunitySeed.unfair_insight, 3, 1, 10),
    moat_network: numberValue(opportunitySeed.moat_network, 5, 1, 10),
    moat_data: numberValue(opportunitySeed.moat_data, 4, 1, 10),
    moat_switching: numberValue(opportunitySeed.moat_switching, 6, 1, 10),
    moat_scale: numberValue(opportunitySeed.moat_scale, 3, 1, 10),
    moat_brand: numberValue(opportunitySeed.moat_brand, 5, 1, 10),
    moat_ip: numberValue(opportunitySeed.moat_ip, 2, 1, 10),
    timing_signals: arrayOfStrings(opportunitySeed.timing_signals)
  });

  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      user_id: user.id,
      ...opportunitySeed,
      opportunity_score: opportunityScore
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create opportunity", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const notesResult = await supabase.from("opportunity_notes").insert({
    opportunity_id: data.id,
    user_id: user.id,
    ...(isExample
      ? {
          thesis:
            "Finance teams are becoming the operational control point for software spend, but procurement intake is still fragmented across Slack, email, spreadsheets, and legacy suites.",
          customer_notes:
            "Target CFOs, controllers, and procurement leads at 200-1,000 person companies with fast SaaS sprawl and budget pressure.",
          open_questions:
            "Who feels the pain daily? Does finance own the workflow or only approve spend? What must integrate on day one?",
          kill_conditions:
            "Kill this if buyers refuse paid pilots, if the workflow owner is too fragmented, or if incumbents already solve intake well enough.",
          moat_insight:
            "The strongest defensibility angle is proprietary approval and vendor-risk data collected across repeated procurement workflows."
        }
      : {})
  });

  if (notesResult.error) {
    console.error("Failed to create opportunity notes", notesResult.error);
    return jsonError("Opportunity created, but notes could not be initialized.", 500);
  }

  const messageResult = await supabase.from("ember_messages").insert({
    opportunity_id: data.id,
    user_id: user.id,
    role: "assistant",
    content: "I'm Ember. Tell me what you're building — or start filling in the fields and I'll analyze as you go.",
    agent_type: "core"
  });

  if (messageResult.error) {
    console.error("Failed to create initial Ember message", messageResult.error);
  }

  if (isExample) {
    const tasksResult = await supabase.from("tasks").insert([
      {
        opportunity_id: data.id,
        user_id: user.id,
        text: "Interview 10 finance leaders about procurement intake pain",
        category: "research",
        priority: "high"
      },
      {
        opportunity_id: data.id,
        user_id: user.id,
        text: "Mock a Slack-to-approval workflow prototype",
        category: "product",
        priority: "medium"
      },
      {
        opportunity_id: data.id,
        user_id: user.id,
        text: "Pitch 3 paid pilot design partners",
        category: "sales",
        priority: "high"
      }
    ]);

    if (tasksResult.error) {
      console.error("Failed to create example tasks", tasksResult.error);
      return jsonError("Example opportunity created, but tasks could not be initialized.", 500);
    }

    const risksResult = await supabase.from("risk_assessments").insert([
      {
        opportunity_id: data.id,
        user_id: user.id,
        risk_label: "Incumbents bundle the workflow",
        heat_level: "high",
        mitigation_note: "Find a narrow wedge legacy suites ignore."
      },
      {
        opportunity_id: data.id,
        user_id: user.id,
        risk_label: "Owner is unclear",
        heat_level: "medium",
        mitigation_note: "Force every discovery call to name the daily workflow owner."
      }
    ]);

    if (risksResult.error) {
      console.error("Failed to create example risks", risksResult.error);
      return jsonError("Example opportunity created, but risks could not be initialized.", 500);
    }
  }

  return NextResponse.json({ opportunity: data }, { status: 201 });
}
