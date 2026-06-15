export type AgentType =
  | "core"
  | "market"
  | "risk"
  | "doc_synthesizer"
  | "execution"
  | "moat";

export type TaskCategory = "research" | "product" | "sales" | "ops" | "hiring";
export type Priority = "low" | "medium" | "high";
export type HeatLevel = "low" | "medium" | "high";
export type RiskCategory = "market" | "technical" | "regulatory" | "team" | "financial" | "timing";
export type RiskMatrixValue = "low" | "high";
export type RiskStatus = "open" | "in_progress" | "mitigated";
export type Phase = "0→1" | "1→10" | "10→100";
export type MarketType = "new_market" | "existing_market" | "resegmented_market" | "clone_market";
export type TimeToCopy = "3_months" | "6_months" | "1_year" | "3_plus_years";
export type PriorStartupExperience = "none" | "one_exit" | "multiple_exits" | "currently_operating";
export type CoFounderStatus = "solo" | "co_founder_found" | "team_assembled";
export type CapitalAccess = "bootstrapped" | "friends_family" | "seeking_seed" | "funded";
export type SignalStatus = "No signal" | "Early signal" | "Strong signal" | "Traction";

export type Opportunity = {
  id: string;
  user_id: string | null;
  is_demo?: boolean;
  name: string;
  opportunity_score: number;
  problem_statement: string;
  target_customer_persona: string;
  urgency: number;
  pain: number;
  frequency: number;
  willingness_to_pay: number;
  customer_discovery_count: number;
  key_insight: string;
  falsifiable_hypothesis: string;
  domain_expertise: number;
  network_access: number;
  unfair_insight: number;
  timing_signals: string[];
  market_type: MarketType;
  business_model: string;
  pricing_model: string;
  acv: string;
  tam_m: number;
  sam_m: number;
  som_m: number;
  growth_rate_pct: number;
  competitors: Competitor[];
  moat_network: number;
  moat_data: number;
  moat_switching: number;
  moat_scale: number;
  moat_brand: number;
  moat_ip: number;
  moat_summary: string;
  time_to_copy: TimeToCopy;
  phase: Phase;
  kpi_primary: string;
  kpi_revenue: string;
  kpi_learning: string;
  sprint_goal_90_day: string;
  runway_months: number;
  next_fundraise_trigger: string;
  conviction_stars: number;
  prior_startup_experience: PriorStartupExperience;
  co_founder_status: CoFounderStatus;
  capital_access: CapitalAccess;
  founder_statement: string;
  lois_verbal_commitments: number;
  waitlist_signups: number;
  pilot_customers: number;
  revenue_to_date: number;
  last_customer_conversation_date: string | null;
  signal_notes: string;
  created_at: string;
  updated_at: string;
};

export type Competitor = {
  name: string;
  threat: HeatLevel;
  differentiator?: string;
  estimated_arr?: string;
};

export type Task = {
  id: string;
  opportunity_id: string;
  user_id: string | null;
  text: string;
  category: TaskCategory;
  phase: Phase;
  done: boolean;
  priority: Priority;
  due_date: string | null;
  created_at: string;
};

export type EmberMessage = {
  id: string;
  opportunity_id: string;
  user_id: string | null;
  role: "user" | "assistant";
  content: string;
  agent_type: AgentType;
  created_at: string;
  response_id?: string | null;
};

export type OpportunityNotes = {
  id: string;
  opportunity_id: string;
  user_id: string | null;
  thesis: string;
  customer_notes: string;
  open_questions: string;
  kill_conditions: string;
  moat_insight: string;
  decision_log: DecisionLogEntry[];
  updated_at: string;
};

export type DecisionLogEntry = {
  id: string;
  body: string;
  created_at: string;
};

export type RiskAssessment = {
  id: string;
  opportunity_id: string;
  user_id: string | null;
  risk_label: string;
  heat_level: HeatLevel;
  category: RiskCategory;
  likelihood: RiskMatrixValue;
  impact: RiskMatrixValue;
  mitigation_note: string;
  owner: string;
  status: RiskStatus;
  created_at: string;
};

export type Milestone = {
  id: string;
  opportunity_id: string;
  user_id: string | null;
  title: string;
  target_date: string | null;
  done: boolean;
  created_at: string;
};

export type DocumentRecord = {
  id: string;
  opportunity_id: string;
  user_id: string | null;
  filename: string;
  storage_path: string;
  extracted_text: string | null;
  file_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
};
