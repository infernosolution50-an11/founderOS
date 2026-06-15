import { calculateOpportunityScore } from "@/lib/score";

type SupabaseLike = {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: string) => any;
    };
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: string) => any;
    };
  };
};

export async function recalculateOpportunityScore(supabase: SupabaseLike, opportunityId: string, userId: string) {
  const [{ data: opportunity }, { data: risks }, { data: tasks }, { data: milestones }] = await Promise.all([
    supabase.from("opportunities").select("*").eq("id", opportunityId).eq("user_id", userId).single(),
    supabase.from("risk_assessments").select("heat_level,status").eq("opportunity_id", opportunityId).eq("user_id", userId),
    supabase.from("tasks").select("done").eq("opportunity_id", opportunityId).eq("user_id", userId),
    supabase.from("milestones").select("done").eq("opportunity_id", opportunityId).eq("user_id", userId)
  ]);

  if (!opportunity) return;
  const opportunity_score = calculateOpportunityScore(opportunity, risks ?? [], tasks ?? [], milestones ?? []);
  await supabase.from("opportunities").update({ opportunity_score }).eq("id", opportunityId).eq("user_id", userId);
}

