import type { AgentType } from "@/types";
import { corePrompt } from "./core";
import { docSynthesizerPrompt } from "./docSynthesizer";
import { executionPrompt } from "./execution";
import { marketPrompt } from "./market";
import { riskPrompt } from "./risk";

export function selectAgentPrompt(agentType: AgentType, context: string) {
  switch (agentType) {
    case "market":
      return marketPrompt(context);
    case "risk":
      return riskPrompt(context);
    case "doc_synthesizer":
      return docSynthesizerPrompt(context);
    case "execution":
      return executionPrompt(context);
    case "core":
    default:
      return corePrompt(context);
  }
}

export const agentLabels: Record<AgentType, string> = {
  core: "Core Co-founder",
  market: "Market Intel",
  risk: "Risk Analyst",
  doc_synthesizer: "Doc Synthesizer",
  execution: "Execution Planner"
};
