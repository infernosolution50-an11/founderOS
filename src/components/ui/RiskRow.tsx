import { cn } from "@/lib/utils";
import type { HeatLevel, RiskAssessment, RiskCategory, RiskMatrixValue, RiskStatus } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FieldLabel } from "@/components/ui/Tooltip";
import { fieldTooltips } from "@/lib/fieldTooltips";

type RiskRowProps = {
  risk: Pick<RiskAssessment, "risk_label" | "heat_level" | "category" | "likelihood" | "impact" | "mitigation_note" | "owner" | "status">;
  disabled?: boolean;
  onChange: (risk: Pick<RiskAssessment, "risk_label" | "heat_level" | "category" | "likelihood" | "impact" | "mitigation_note" | "owner" | "status">) => void;
};

const heatClasses: Record<HeatLevel, string> = {
  low: "bg-os-green",
  medium: "bg-os-amber",
  high: "bg-os-red"
};

const heatTone: Record<HeatLevel, "green" | "amber" | "red"> = {
  low: "green",
  medium: "amber",
  high: "red"
};

export function RiskRow({ risk, disabled, onChange }: RiskRowProps) {
  return (
    <Card className="grid gap-3">
      <div className="flex items-center gap-3">
        <Badge tone={heatTone[risk.heat_level]} className="gap-2 capitalize">
          <span className={cn("h-2 w-2 rounded-full", heatClasses[risk.heat_level])} aria-hidden="true" />
          {risk.heat_level}
        </Badge>
        <input
          aria-label="Risk label"
          value={risk.risk_label}
          disabled={disabled}
          onChange={(event) => onChange({ ...risk, risk_label: event.target.value })}
          className="h-11 min-w-0 flex-1 rounded-os-md border border-transparent bg-transparent px-2 text-os-sm text-os-text focus:border-os-indigo disabled:opacity-50 md:h-9"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <Select label="Category" value={risk.category} tooltip={fieldTooltips.risk_category} disabled={disabled} options={["market", "technical", "regulatory", "team", "financial", "timing"]} onChange={(category) => onChange({ ...risk, category: category as RiskCategory })} />
        <Select label="Heat" value={risk.heat_level} tooltip={fieldTooltips.heat_level} disabled={disabled} options={["low", "medium", "high"]} onChange={(heat_level) => onChange({ ...risk, heat_level: heat_level as HeatLevel })} />
        <Select label="Likelihood" value={risk.likelihood} tooltip={fieldTooltips.risk_likelihood} disabled={disabled} options={["low", "high"]} onChange={(likelihood) => onChange({ ...risk, likelihood: likelihood as RiskMatrixValue })} />
        <Select label="Impact" value={risk.impact} tooltip={fieldTooltips.risk_impact} disabled={disabled} options={["low", "high"]} onChange={(impact) => onChange({ ...risk, impact: impact as RiskMatrixValue })} />
        <Select label="Status" value={risk.status} tooltip={fieldTooltips.risk_status} disabled={disabled} options={["open", "in_progress", "mitigated"]} onChange={(status) => onChange({ ...risk, status: status as RiskStatus })} />
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_1.4fr]">
        <label className="grid gap-1 text-os-xs uppercase tracking-[0.14em] text-os-sub">
          <FieldLabel label="Owner" tooltip={fieldTooltips.risk_owner} />
          <input
            value={risk.owner}
            disabled={disabled}
            onChange={(event) => onChange({ ...risk, owner: event.target.value })}
            className="h-11 rounded-os-md border border-os-border bg-os-panel px-3 py-2 text-os-sm normal-case tracking-normal text-os-text focus:border-os-indigo disabled:opacity-50 md:h-9"
          />
        </label>
        <label className="grid gap-1 text-os-xs uppercase tracking-[0.14em] text-os-sub">
          <FieldLabel label="Mitigation note" tooltip={fieldTooltips.mitigation_note} />
          <input
            value={risk.mitigation_note}
            disabled={disabled}
            onChange={(event) => onChange({ ...risk, mitigation_note: event.target.value })}
            placeholder="Mitigation note"
            className="h-11 rounded-os-md border border-os-border bg-os-panel px-3 py-2 text-os-sm normal-case tracking-normal text-os-text placeholder:text-os-muted focus:border-os-indigo disabled:opacity-50 md:h-9"
          />
        </label>
      </div>
    </Card>
  );
}

function Select({ label, tooltip, value, options, disabled, onChange }: { label: string; tooltip: string; value: string; options: string[]; disabled?: boolean; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-os-xs uppercase tracking-[0.14em] text-os-sub">
      <FieldLabel label={label} tooltip={tooltip} />
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-os-md border border-os-border bg-os-panel px-3 py-2 text-os-sm normal-case tracking-normal text-os-text focus:border-os-indigo disabled:opacity-50 md:h-9"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
