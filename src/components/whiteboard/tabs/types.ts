import type { DocumentRecord, Milestone, Opportunity, OpportunityNotes, RiskAssessment, Task } from "@/types";

export type WhiteboardTabProps = {
  opportunity: Opportunity;
  notes: OpportunityNotes;
  risks: RiskAssessment[];
  tasks: Task[];
  milestones: Milestone[];
  documents: DocumentRecord[];
  isReadOnly?: boolean;
  onOpportunityChange: (patch: Partial<Opportunity>) => void;
  onNotesChange: (patch: Partial<OpportunityNotes>) => void;
  onRisksChange: (risks: RiskAssessment[]) => void;
  onMilestonesChange: (milestones: Milestone[]) => void;
  onAgentAction: (message: string) => void;
  onFillSection?: (section: string) => void | Promise<void>;
  onFieldUpdates?: (payload: unknown) => void;
  onDocumentsChanged?: () => void | Promise<void>;
};
