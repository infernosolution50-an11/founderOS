import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { FieldLabel } from "@/components/ui/Tooltip";
import { fieldTooltips } from "@/lib/fieldTooltips";
import type { WhiteboardTabProps } from "./types";

export function ResearchTab({ opportunity, isReadOnly, onOpportunityChange, onFillSection }: WhiteboardTabProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Research</h2>
        <Button type="button" variant="secondary" size="sm" disabled={isReadOnly} onClick={() => onFillSection?.("Research")}>
          Ask Ember to fill this section
        </Button>
      </div>

      {[
        ["problem_statement", "Problem statement", 5],
        ["target_customer_persona", "Target customer persona", 4],
        ["key_insight", "Key insight", 3],
        ["falsifiable_hypothesis", "Falsifiable hypothesis", 3]
      ].map(([key, label, rows]) => (
        <label key={key} className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
          <FieldLabel label={label} tooltip={fieldTooltips[key as keyof typeof fieldTooltips]} />
          <textarea
            value={String(opportunity[key as keyof typeof opportunity] ?? "")}
            onChange={(event) => onOpportunityChange({ [key]: event.target.value })}
            rows={Number(rows)}
            disabled={isReadOnly}
            className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
          />
        </label>
      ))}

      <section>
        <h2 className="font-display text-xl font-semibold">Problem strength</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Slider label="Urgency" tooltip={fieldTooltips.urgency} value={opportunity.urgency} disabled={isReadOnly} onChange={(urgency) => onOpportunityChange({ urgency })} />
          <Slider label="Pain intensity" tooltip={fieldTooltips.pain} value={opportunity.pain} disabled={isReadOnly} onChange={(pain) => onOpportunityChange({ pain })} />
          <Slider label="Frequency" tooltip={fieldTooltips.frequency} value={opportunity.frequency} disabled={isReadOnly} onChange={(frequency) => onOpportunityChange({ frequency })} />
          <Slider
            label="Willingness to pay"
            tooltip={fieldTooltips.willingness_to_pay}
            value={opportunity.willingness_to_pay}
            disabled={isReadOnly}
            onChange={(willingness_to_pay) => onOpportunityChange({ willingness_to_pay })}
          />
        </div>
      </section>

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        <FieldLabel label="Customer discovery count" tooltip={fieldTooltips.customer_discovery_count} />
        <input
          type="number"
          min={0}
          value={opportunity.customer_discovery_count}
          disabled={isReadOnly}
          onChange={(event) => onOpportunityChange({ customer_discovery_count: Number(event.target.value) })}
          className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
        />
      </label>
    </div>
  );
}
