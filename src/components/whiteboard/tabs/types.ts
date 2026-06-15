import type { DocumentRecord, Opportunity, OpportunityNotes, RiskAssessment, Task } from "@/types";

export type WhiteboardTabProps = {
  opportunity: Opportunity;
  notes: OpportunityNotes;
  risks: RiskAssessment[];
  tasks: Task[];
  documents: DocumentRecord[];
  isReadOnly?: boolean;
  onOpportunityChange: (patch: Partial<Opportunity>) => void;
  onNotesChange: (patch: Partial<OpportunityNotes>) => void;
  onRisksChange: (risks: RiskAssessment[]) => void;
  onAgentAction: (message: string) => void;
  onDocumentsChanged?: () => void | Promise<void>;
};
