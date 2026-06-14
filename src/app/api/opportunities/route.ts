import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";

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

  const body = await request.json().catch(() => ({}));
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
        name: body.name || "Untitled Opportunity"
      };

  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      user_id: user.id,
      ...opportunitySeed
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("opportunity_notes").insert({
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

  await supabase.from("ember_messages").insert({
    opportunity_id: data.id,
    user_id: user.id,
    role: "assistant",
    content: "I'm Ember. Tell me what you're building — or start filling in the fields and I'll analyze as you go.",
    agent_type: "core"
  });

  if (isExample) {
    await supabase.from("tasks").insert([
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

    await supabase.from("risk_assessments").insert([
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
  }

  return NextResponse.json({ opportunity: data }, { status: 201 });
}
