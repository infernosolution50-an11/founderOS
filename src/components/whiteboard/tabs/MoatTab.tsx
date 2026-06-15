import { Button } from "@/components/ui/Button";
import { MoatCard } from "@/components/ui/MoatCard";
import { PillSelector } from "@/components/ui/PillSelector";
import { FieldLabel } from "@/components/ui/Tooltip";
import { fieldTooltips } from "@/lib/fieldTooltips";
import type { TimeToCopy } from "@/types";
import type { WhiteboardTabProps } from "./types";

const timeToCopyOptions: Array<{ label: string; value: TimeToCopy }> = [
  { label: "3 months", value: "3_months" },
  { label: "6 months", value: "6_months" },
  { label: "1 year", value: "1_year" },
  { label: "3+ years", value: "3_plus_years" }
];

export function MoatTab({ opportunity, notes, isReadOnly, onOpportunityChange, onNotesChange, onAgentAction, onFillSection }: WhiteboardTabProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Moat</h2>
        <Button type="button" variant="secondary" size="sm" disabled={isReadOnly} onClick={() => onFillSection?.("Moat")}>
          Ask Ember to fill this section
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <MoatCard label="Network effects" tooltip={fieldTooltips.moat_network} disabled={isReadOnly} value={opportunity.moat_network} colorClass="bg-os-indigo" onChange={(moat_network) => onOpportunityChange({ moat_network })} />
        <MoatCard label="Proprietary data" tooltip={fieldTooltips.moat_data} disabled={isReadOnly} value={opportunity.moat_data} colorClass="bg-os-amber" onChange={(moat_data) => onOpportunityChange({ moat_data })} />
        <MoatCard label="Switching costs" tooltip={fieldTooltips.moat_switching} disabled={isReadOnly} value={opportunity.moat_switching} colorClass="bg-os-green" onChange={(moat_switching) => onOpportunityChange({ moat_switching })} />
        <MoatCard label="Scale economies" tooltip={fieldTooltips.moat_scale} disabled={isReadOnly} value={opportunity.moat_scale} colorClass="bg-os-red" onChange={(moat_scale) => onOpportunityChange({ moat_scale })} />
        <MoatCard label="Brand" tooltip={fieldTooltips.moat_brand} disabled={isReadOnly} value={opportunity.moat_brand} colorClass="bg-os-indigo-dim" onChange={(moat_brand) => onOpportunityChange({ moat_brand })} />
        <MoatCard label="IP / patents" tooltip={fieldTooltips.moat_ip} disabled={isReadOnly} value={opportunity.moat_ip} colorClass="bg-os-muted" onChange={(moat_ip) => onOpportunityChange({ moat_ip })} />
      </div>

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        <FieldLabel label="Moat summary" tooltip={fieldTooltips.moat_summary} />
        <textarea
          value={opportunity.moat_summary}
          disabled={isReadOnly}
          onChange={(event) => onOpportunityChange({ moat_summary: event.target.value })}
          rows={4}
          className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
        />
      </label>

      <PillSelector
        label="Time to copy"
        tooltip={fieldTooltips.time_to_copy}
        options={timeToCopyOptions.map((option) => option.label)}
        value={timeToCopyOptions.find((option) => option.value === opportunity.time_to_copy)?.label ?? "1 year"}
        disabled={isReadOnly}
        onChange={(label) => onOpportunityChange({ time_to_copy: timeToCopyOptions.find((option) => option.label === label)?.value ?? "1_year" })}
      />

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        <FieldLabel label="Moat insight" tooltip={fieldTooltips.moat_insight} />
        <textarea
          value={notes.moat_insight}
          disabled={isReadOnly}
          onChange={(event) => onNotesChange({ moat_insight: event.target.value })}
          rows={5}
          className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
        />
      </label>

      <button type="button" disabled={isReadOnly} onClick={() => onAgentAction("Build the moat")} className="rounded-xl bg-os-indigo px-4 py-3 font-semibold text-white disabled:opacity-50">
        AI analysis
      </button>
    </div>
  );
}
