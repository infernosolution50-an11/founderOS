import { cn } from "@/lib/utils";
import type { HeatLevel, RiskAssessment } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type RiskRowProps = {
  risk: Pick<RiskAssessment, "risk_label" | "heat_level" | "mitigation_note">;
  onChange: (risk: Pick<RiskAssessment, "risk_label" | "heat_level" | "mitigation_note">) => void;
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

export function RiskRow({ risk, onChange }: RiskRowProps) {
  return (
    <Card className="grid gap-3 md:grid-cols-[1fr_auto_1.2fr]">
      <div className="flex items-center gap-3">
        <Badge tone={heatTone[risk.heat_level]} className="gap-2 capitalize">
          <span className={cn("h-2 w-2 rounded-full", heatClasses[risk.heat_level])} aria-hidden="true" />
          {risk.heat_level}
        </Badge>
        <input
          aria-label="Risk label"
          value={risk.risk_label}
          onChange={(event) => onChange({ ...risk, risk_label: event.target.value })}
          className="h-11 min-w-0 flex-1 rounded-os-md border border-transparent bg-transparent px-2 text-os-sm text-os-text focus:border-os-indigo md:h-9"
        />
      </div>
      <select
        aria-label={`Heat level for ${risk.risk_label}`}
        value={risk.heat_level}
        onChange={(event) => onChange({ ...risk, heat_level: event.target.value as HeatLevel })}
        className="h-11 rounded-os-md border border-os-border bg-os-panel px-3 py-2 text-os-sm text-os-text focus:border-os-indigo md:h-9"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <input
        aria-label={`Mitigation note for ${risk.risk_label}`}
        value={risk.mitigation_note}
        onChange={(event) => onChange({ ...risk, mitigation_note: event.target.value })}
        placeholder="Mitigation note"
        className="h-11 rounded-os-md border border-os-border bg-os-panel px-3 py-2 text-os-sm text-os-text placeholder:text-os-muted focus:border-os-indigo md:h-9"
      />
    </Card>
  );
}
