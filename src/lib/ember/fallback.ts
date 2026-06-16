import { normalizeEmberFieldPatch } from "./fieldUpdates";

export function fallbackAutofillPatch(opportunityName: string, idea: string) {
  const description = idea.trim() || opportunityName;
  const shortName = opportunityName.trim() || "Untitled opportunity";

  return normalizeEmberFieldPatch({
    fields: {
      opportunity: {
        problem_statement: { value: `${shortName} needs sharper validation: ${description}`, confidence: "low" },
        target_customer_persona: { value: "Early adopters who feel this problem frequently and have budget or urgency to act.", confidence: "low" },
        urgency: { value: 6, confidence: "low" },
        pain: { value: 6, confidence: "low" },
        frequency: { value: 6, confidence: "low" },
        willingness_to_pay: { value: 4, confidence: "low" },
        customer_discovery_count: { value: 0, confidence: "low" },
        key_insight: { value: "Needs customer discovery before treating this as true.", confidence: "low" },
        falsifiable_hypothesis: { value: "If target customers will not schedule discovery calls or commit to a pilot, the opportunity is weak.", confidence: "low" },
        market_type: { value: "existing_market", confidence: "low" },
        timing_signals: { value: ["Founder hypothesis"], confidence: "low" },
        business_model: { value: "To be validated", confidence: "low" },
        pricing_model: { value: "Pilot pricing to be tested", confidence: "low" },
        acv: { value: "Unknown", confidence: "low" },
        tam_m: { value: 0, confidence: "low" },
        sam_m: { value: 0, confidence: "low" },
        som_m: { value: 0, confidence: "low" },
        growth_rate_pct: { value: 0, confidence: "low" },
        competitors: { value: [{ name: "Status quo", threat: "high", differentiator: "Needs proof of a better workflow", estimated_arr: "Unknown" }], confidence: "low" },
        moat_network: { value: 3, confidence: "low" },
        moat_data: { value: 3, confidence: "low" },
        moat_switching: { value: 3, confidence: "low" },
        moat_scale: { value: 3, confidence: "low" },
        moat_brand: { value: 2, confidence: "low" },
        moat_ip: { value: 2, confidence: "low" },
        moat_summary: { value: "No durable moat is proven yet. The first moat is learning speed and customer access.", confidence: "low" },
        time_to_copy: { value: "6_months", confidence: "low" },
        phase: { value: "0→1", confidence: "medium" },
        kpi_primary: { value: "Qualified customer discovery calls completed", confidence: "medium" },
        kpi_revenue: { value: "Pilot commitments or paid design partners", confidence: "low" },
        kpi_learning: { value: "Validate buyer, pain intensity, and willingness to pay", confidence: "medium" },
        sprint_goal_90_day: { value: "Validate the painful use case and secure at least one pilot commitment.", confidence: "medium" },
        runway_months: { value: 0, confidence: "low" },
        next_fundraise_trigger: { value: "Evidence of repeated customer pull and a credible wedge.", confidence: "low" },
        domain_expertise: { value: 3, confidence: "low" },
        network_access: { value: 3, confidence: "low" },
        unfair_insight: { value: 3, confidence: "low" },
        conviction_stars: { value: 3, confidence: "low" },
        prior_startup_experience: { value: "none", confidence: "low" },
        co_founder_status: { value: "solo", confidence: "low" },
        capital_access: { value: "bootstrapped", confidence: "low" },
        founder_statement: { value: "I need to prove why I am uniquely positioned to win this market.", confidence: "low" },
        lois_verbal_commitments: { value: 0, confidence: "low" },
        waitlist_signups: { value: 0, confidence: "low" },
        pilot_customers: { value: 0, confidence: "low" },
        revenue_to_date: { value: 0, confidence: "low" },
        last_customer_conversation_date: { value: null, confidence: "low" },
        signal_notes: { value: "No external validation recorded yet.", confidence: "low" }
      },
      notes: {
        thesis: { value: `${shortName} may matter if the stated problem is urgent, frequent, and owned by a reachable buyer.`, confidence: "low" },
        customer_notes: { value: "No customer notes yet. Start with five direct discovery calls.", confidence: "low" },
        open_questions: { value: "Who owns the budget? How often does this hurt? What do customers do today? What would make them switch?", confidence: "medium" },
        kill_conditions: { value: "Kill or radically reframe this if buyers will not take discovery calls, cannot name the pain, or will not commit to a pilot.", confidence: "medium" },
        moat_insight: { value: "The near-term edge must come from faster learning and a sharper wedge, not claimed defensibility.", confidence: "medium" },
        decision_log: { value: [{ body: "Created first-pass Ember draft from minimal founder input." }], confidence: "medium" }
      },
      risks: [
        { risk_label: "Pain is not urgent enough", category: "market", heat_level: "high", likelihood: "high", impact: "high", mitigation_note: "Run discovery calls that force buyers to rank this against current priorities.", owner: "Founder", status: "open", confidence: "medium" },
        { risk_label: "Buyer and user are unclear", category: "market", heat_level: "medium", likelihood: "high", impact: "high", mitigation_note: "Map user, buyer, budget owner, and approval path in every interview.", owner: "Founder", status: "open", confidence: "medium" }
      ],
      milestones: [
        { title: "Complete five discovery calls", target_date: null, done: false, confidence: "medium" },
        { title: "Secure one pilot commitment", target_date: null, done: false, confidence: "low" }
      ],
      tasks: [
        { text: "Write the top three buyer hypotheses", category: "research", phase: "0→1", priority: "high", due_date: null, done: false, confidence: "medium" },
        { text: "Interview five target customers", category: "research", phase: "0→1", priority: "high", due_date: null, done: false, confidence: "medium" },
        { text: "Ask one prospect for a pilot commitment", category: "sales", phase: "0→1", priority: "medium", due_date: null, done: false, confidence: "low" }
      ]
    }
  });
}
