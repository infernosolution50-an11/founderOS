import type { AgentType } from "@/types";

type ContextInput = {
  opportunity: Record<string, unknown>;
  notes?: Record<string, unknown> | null;
  risks?: Record<string, unknown>[];
  tasks?: Record<string, unknown>[];
  documents?: Record<string, unknown>[];
  extra?: string;
};

export function buildOpportunityContext({ opportunity, notes, risks = [], tasks = [], documents = [], extra }: ContextInput) {
  return [
    `Opportunity: ${JSON.stringify(opportunity, null, 2)}`,
    `Notes: ${JSON.stringify(notes ?? {}, null, 2)}`,
    `Risks: ${JSON.stringify(risks, null, 2)}`,
    `Tasks: ${JSON.stringify(tasks, null, 2)}`,
    `Documents: ${JSON.stringify(
      documents.map((document) => ({
        filename: document.filename,
        file_type: document.file_type,
        file_size_bytes: document.file_size_bytes,
        created_at: document.created_at
      })),
      null,
      2
    )}`,
    extra ? `Additional context:\n${extra}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function normalizeAgentType(agentType: unknown): AgentType {
  const allowed: AgentType[] = ["core", "market", "risk", "doc_synthesizer", "execution", "moat"];
  return allowed.includes(agentType as AgentType) ? (agentType as AgentType) : "core";
}
