import { cn } from "@/lib/utils";
import type { HeatLevel, RiskAssessment } from "@/types";

type RiskRowProps = {
  risk: Pick<RiskAssessment, "risk_label" | "heat_level" | "mitigation_note">;
  onChange: (risk: Pick<RiskAssessment, "risk_label" | "heat_level" | "mitigation_note">) => void;
};

const heatClasses: Record<HeatLevel, string> = {
  low: "bg-os-green",
  medium: "bg-os-amber",
  high: "bg-os-red"
};

export function RiskRow({ risk, onChange }: RiskRowProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-os-border bg-os-surface p-4 md:grid-cols-[1fr_auto_1.2fr]">
      <div className="flex items-center gap-3">
        <span className={cn("h-3 w-3 rounded-full", heatClasses[risk.heat_level])} />
        <input
          value={risk.risk_label}
          onChange={(event) => onChange({ ...risk, risk_label: event.target.value })}
          className="w-full bg-transparent text-sm text-os-text outline-none"
        />
      </div>
      <select
        value={risk.heat_level}
        onChange={(event) => onChange({ ...risk, heat_level: event.target.value as HeatLevel })}
        className="rounded-xl border border-os-border bg-os-panel px-3 py-2 text-sm text-os-text"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <input
        value={risk.mitigation_note}
        onChange={(event) => onChange({ ...risk, mitigation_note: event.target.value })}
        placeholder="Mitigation note"
        className="rounded-xl border border-os-border bg-os-panel px-3 py-2 text-sm text-os-text outline-none"
      />
    </div>
  );
}
