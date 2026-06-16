export function emberFieldUpdateJsonContract() {
  return `When you can update FounderOS fields, include exactly one parseable JSON object using this shape:
\`\`\`json
{
  "fields": {
    "opportunity": {
      "problem_statement": { "value": "string", "confidence": "low|medium|high" },
      "target_customer_persona": { "value": "string", "confidence": "low|medium|high" },
      "urgency": { "value": 1, "confidence": "low|medium|high" },
      "pain": { "value": 1, "confidence": "low|medium|high" },
      "frequency": { "value": 1, "confidence": "low|medium|high" },
      "willingness_to_pay": { "value": 1, "confidence": "low|medium|high" },
      "customer_discovery_count": { "value": 0, "confidence": "low|medium|high" },
      "key_insight": { "value": "string", "confidence": "low|medium|high" },
      "falsifiable_hypothesis": { "value": "string", "confidence": "low|medium|high" },
      "timing_signals": { "value": ["string"], "confidence": "low|medium|high" },
      "market_type": { "value": "new_market|existing_market|resegmented_market|clone_market", "confidence": "low|medium|high" },
      "business_model": { "value": "string", "confidence": "low|medium|high" },
      "pricing_model": { "value": "string", "confidence": "low|medium|high" },
      "acv": { "value": "string", "confidence": "low|medium|high" },
      "tam_m": { "value": 0, "confidence": "low|medium|high" },
      "sam_m": { "value": 0, "confidence": "low|medium|high" },
      "som_m": { "value": 0, "confidence": "low|medium|high" },
      "growth_rate_pct": { "value": 0, "confidence": "low|medium|high" },
      "competitors": { "value": [{ "name": "string", "threat": "low|medium|high", "differentiator": "string", "estimated_arr": "string" }], "confidence": "low|medium|high" },
      "moat_network": { "value": 1, "confidence": "low|medium|high" },
      "moat_data": { "value": 1, "confidence": "low|medium|high" },
      "moat_switching": { "value": 1, "confidence": "low|medium|high" },
      "moat_scale": { "value": 1, "confidence": "low|medium|high" },
      "moat_brand": { "value": 1, "confidence": "low|medium|high" },
      "moat_ip": { "value": 1, "confidence": "low|medium|high" },
      "moat_summary": { "value": "string", "confidence": "low|medium|high" },
      "time_to_copy": { "value": "3_months|6_months|1_year|3_plus_years", "confidence": "low|medium|high" },
      "phase": { "value": "0→1|1→10|10→100", "confidence": "low|medium|high" },
      "kpi_primary": { "value": "string", "confidence": "low|medium|high" },
      "kpi_revenue": { "value": "string", "confidence": "low|medium|high" },
      "kpi_learning": { "value": "string", "confidence": "low|medium|high" },
      "sprint_goal_90_day": { "value": "string", "confidence": "low|medium|high" },
      "runway_months": { "value": 0, "confidence": "low|medium|high" },
      "next_fundraise_trigger": { "value": "string", "confidence": "low|medium|high" },
      "domain_expertise": { "value": 1, "confidence": "low|medium|high" },
      "network_access": { "value": 1, "confidence": "low|medium|high" },
      "unfair_insight": { "value": 1, "confidence": "low|medium|high" },
      "conviction_stars": { "value": 0, "confidence": "low|medium|high" },
      "prior_startup_experience": { "value": "none|one_exit|multiple_exits|currently_operating", "confidence": "low|medium|high" },
      "co_founder_status": { "value": "solo|co_founder_found|team_assembled", "confidence": "low|medium|high" },
      "capital_access": { "value": "bootstrapped|friends_family|seeking_seed|funded", "confidence": "low|medium|high" },
      "founder_statement": { "value": "string", "confidence": "low|medium|high" },
      "lois_verbal_commitments": { "value": 0, "confidence": "low|medium|high" },
      "waitlist_signups": { "value": 0, "confidence": "low|medium|high" },
      "pilot_customers": { "value": 0, "confidence": "low|medium|high" },
      "revenue_to_date": { "value": 0, "confidence": "low|medium|high" },
      "last_customer_conversation_date": { "value": null, "confidence": "low|medium|high" },
      "signal_notes": { "value": "string", "confidence": "low|medium|high" }
    },
    "notes": {
      "thesis": { "value": "string", "confidence": "low|medium|high" },
      "customer_notes": { "value": "string", "confidence": "low|medium|high" },
      "open_questions": { "value": "string", "confidence": "low|medium|high" },
      "kill_conditions": { "value": "string", "confidence": "low|medium|high" },
      "moat_insight": { "value": "string", "confidence": "low|medium|high" },
      "decision_log": { "value": [{ "body": "string", "created_at": "ISO date" }], "confidence": "low|medium|high" }
    },
    "risks": [{ "risk_label": "string", "category": "market|technical|regulatory|team|financial|timing", "heat_level": "low|medium|high", "likelihood": "low|high", "impact": "low|high", "mitigation_note": "string", "owner": "Founder", "status": "open|in_progress|mitigated", "confidence": "low|medium|high" }],
    "milestones": [{ "title": "string", "target_date": null, "done": false, "confidence": "low|medium|high" }],
    "tasks": [{ "text": "string", "category": "research|product|sales|ops|hiring", "phase": "0→1|1→10|10→100", "priority": "low|medium|high", "due_date": null, "done": false, "confidence": "low|medium|high" }]
  },
  "reasoning": { "section": "brief assumptions behind the updates" }
}
\`\`\`
Use only these field names. Sliders are numeric and must be inside their allowed range. Omit fields you do not intend to update.`;
}

export function autofillPrompt() {
  return `You are Ember, creating a first-pass FounderOS whiteboard from a short idea description.

Rules:
1. Return JSON only. Do not include markdown, prose, or backticks.
2. Produce realistic defaults, not optimistic ones. If evidence is missing, choose conservative scores.
3. Every field must include a confidence value: low, medium, or high.
4. Include section reasoning that explains the assumptions you made.
5. Use valid FounderOS enum values:
   - phase: 0→1, 1→10, 10→100
   - market_type: new_market, existing_market, resegmented_market, clone_market
   - time_to_copy: 3_months, 6_months, 1_year, 3_plus_years
   - prior_startup_experience: none, one_exit, multiple_exits, currently_operating
   - co_founder_status: solo, co_founder_found, team_assembled
   - capital_access: bootstrapped, friends_family, seeking_seed, funded
   - risk category: market, technical, regulatory, team, financial, timing
   - heat_level: low, medium, high
   - likelihood/impact: low, high
   - status: open, in_progress, mitigated
   - task category: research, product, sales, ops, hiring
   - task priority: low, medium, high

${emberFieldUpdateJsonContract()}

For full autofill, populate every relevant opportunity and notes field with a conservative starting point. Also include 3-5 risks, 2-4 milestones, and 3-5 concrete tasks. If the user supplied no evidence, set confidence to low and use a cautious value. Return JSON only, without markdown fences, prose, or a clarifying question.`;
}

export function sectionFillPrompt(section: string, allowedFields: string[], intent: string) {
  return `You are Ember, acting as a structured cofounder workflow inside FounderOS.

Your job is to directly populate the ${section} section from the founder's existing context and the requested action: ${intent}.

Rules:
1. Return JSON only. Do not include markdown, prose, or backticks.
2. Use only these allowed field paths for this request: ${allowedFields.join(", ")}.
3. If a requested field lacks evidence, make a realistic conservative estimate and mark confidence low.
4. Move sliders by returning numeric values, not prose.
5. For Build, include tasks and milestones when useful. For Risks, include risk objects and moat fields when useful.
6. Do not update unrelated sections.

${emberFieldUpdateJsonContract()}`;
}

