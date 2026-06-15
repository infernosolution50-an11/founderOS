export type AgentType =
  | "core"
  | "market"
  | "risk"
  | "doc_synthesizer"
  | "execution"
  | "moat";

export type TaskCategory = "research" | "product" | "sales" | "ops";
export type Priority = "low" | "medium" | "high";
export type HeatLevel = "low" | "medium" | "high";
export type Phase = "0→1" | "1→10" | "10→100";

export type Opportunity = {
  id: string;
  user_id: string | null;
  is_demo?: boolean;
  name: string;
  opportunity_score: number;
  urgency: number;
  pain: number;
  frequency: number;
  willingness_to_pay: number;
  domain_expertise: number;
  network_access: number;
  unfair_insight: number;
  timing_signals: string[];
  business_model: string;
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
  phase: Phase;
  kpi_primary: string;
  kpi_revenue: string;
  kpi_learning: string;
  conviction_stars: number;
  created_at: string;
  updated_at: string;
};

export type Competitor = {
  name: string;
  threat: HeatLevel;
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
  updated_at: string;
};

export type RiskAssessment = {
  id: string;
  opportunity_id: string;
  user_id: string | null;
  risk_label: string;
  heat_level: HeatLevel;
  mitigation_note: string;
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
