import { RiskRow } from "@/components/ui/RiskRow";
import type { RiskAssessment } from "@/types";
import type { WhiteboardTabProps } from "./types";

const defaultRisks = ["Customer apathy", "Distribution failure", "Low willingness to pay", "Incumbent response", "Execution complexity", "Timing mismatch"];

export function RisksTab({ risks, notes, onRisksChange, onNotesChange, onAgentAction, opportunity }: WhiteboardTabProps) {
  const rows =
    risks.length > 0
      ? risks
      : defaultRisks.map((risk_label) => ({
          id: risk_label,
          opportunity_id: opportunity.id,
          user_id: opportunity.user_id,
          risk_label,
          heat_level: "medium" as const,
          mitigation_note: "",
          created_at: new Date().toISOString()
        }));

  function updateRisk(index: number, risk: Pick<RiskAssessment, "risk_label" | "heat_level" | "mitigation_note">) {
    onRisksChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...risk } : row)));
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        {rows.map((risk, index) => (
          <RiskRow key={`${risk.id}-${index}`} risk={risk} onChange={(next) => updateRisk(index, next)} />
        ))}
      </section>

      <button
        type="button"
        onClick={() =>
          onRisksChange([
            ...rows,
            {
              id: crypto.randomUUID(),
              opportunity_id: opportunity.id,
              user_id: opportunity.user_id,
              risk_label: "Custom risk",
              heat_level: "medium",
              mitigation_note: "",
              created_at: new Date().toISOString()
            }
          ])
        }
        className="rounded-xl border border-os-border px-4 py-2 text-sm text-os-sub hover:text-os-text"
      >
        Add custom risk
      </button>

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        Kill conditions
        <textarea
          value={notes.kill_conditions}
          onChange={(event) => onNotesChange({ kill_conditions: event.target.value })}
          rows={5}
          className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text outline-none"
        />
      </label>

      <button type="button" onClick={() => onAgentAction("Find hidden risks")} className="rounded-xl bg-os-indigo px-4 py-3 font-semibold text-white">
        Find hidden risks
      </button>
    </div>
  );
}
