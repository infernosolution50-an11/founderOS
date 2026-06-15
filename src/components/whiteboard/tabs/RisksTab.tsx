import { RiskRow } from "@/components/ui/RiskRow";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/Tooltip";
import { fieldTooltips } from "@/lib/fieldTooltips";
import type { RiskAssessment } from "@/types";
import type { WhiteboardTabProps } from "./types";

const defaultRisks = ["Customer apathy", "Distribution failure", "Low willingness to pay", "Incumbent response", "Execution complexity", "Timing mismatch"];

export function RisksTab({ risks, notes, isReadOnly, onRisksChange, onNotesChange, onAgentAction, onFillSection, opportunity }: WhiteboardTabProps) {
  const rows =
    risks.length > 0
      ? risks
      : defaultRisks.map((risk_label) => ({
          id: risk_label,
          opportunity_id: opportunity.id,
          user_id: opportunity.user_id,
          risk_label,
          heat_level: "medium" as const,
          category: "market" as const,
          likelihood: "high" as const,
          impact: "high" as const,
          mitigation_note: "",
          owner: "",
          status: "open" as const,
          created_at: new Date().toISOString()
        }));

  function updateRisk(index: number, risk: Pick<RiskAssessment, "risk_label" | "heat_level" | "category" | "likelihood" | "impact" | "mitigation_note" | "owner" | "status">) {
    onRisksChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...risk } : row)));
  }

  const matrix = [
    { label: "High impact / High likelihood", impact: "high", likelihood: "high" },
    { label: "High impact / Low likelihood", impact: "high", likelihood: "low" },
    { label: "Low impact / High likelihood", impact: "low", likelihood: "high" },
    { label: "Low impact / Low likelihood", impact: "low", likelihood: "low" }
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Risks</h2>
        <Button type="button" variant="secondary" size="sm" disabled={isReadOnly} onClick={() => onFillSection?.("Risks")}>
          Ask Ember to fill this section
        </Button>
      </div>

      <section className="grid gap-3 md:grid-cols-2">
        {matrix.map((cell) => {
          const cellRisks = rows.filter((risk) => risk.impact === cell.impact && risk.likelihood === cell.likelihood);
          return (
            <div key={cell.label} className="min-h-32 rounded-2xl border border-os-border bg-os-surface p-4">
              <h3 className="font-display text-sm font-semibold text-os-text">{cell.label}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {cellRisks.length === 0 ? <span className="text-os-xs text-os-muted">No risks</span> : cellRisks.map((risk) => <span key={risk.id} className="rounded-full border border-os-border bg-os-panel px-2 py-1 text-os-xs text-os-sub">{risk.risk_label}</span>)}
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        {rows.map((risk, index) => (
          <RiskRow key={`${risk.id}-${index}`} risk={risk} disabled={isReadOnly} onChange={(next) => updateRisk(index, next)} />
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
              category: "market",
              likelihood: "high",
              impact: "high",
              mitigation_note: "",
              owner: "Founder",
              status: "open",
              created_at: new Date().toISOString()
            }
          ])
        }
        disabled={isReadOnly}
        className="rounded-xl border border-os-border px-4 py-2 text-sm text-os-sub hover:text-os-text"
      >
        Add custom risk
      </button>

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        <FieldLabel label="Kill conditions" tooltip={fieldTooltips.kill_conditions} />
        <textarea
          value={notes.kill_conditions}
          disabled={isReadOnly}
          onChange={(event) => onNotesChange({ kill_conditions: event.target.value })}
          rows={5}
          className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
        />
      </label>

      <button type="button" disabled={isReadOnly} onClick={() => onAgentAction("Find hidden risks")} className="rounded-xl bg-os-indigo px-4 py-3 font-semibold text-white disabled:opacity-50">
        Find hidden risks
      </button>
    </div>
  );
}
