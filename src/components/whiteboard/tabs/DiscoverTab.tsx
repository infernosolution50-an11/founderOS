import { DotRating } from "@/components/ui/DotRating";
import { EmberFieldButton } from "@/components/ui/EmberFieldButton";
import { EmberSectionButton } from "@/components/ui/EmberSectionButton";
import { Slider } from "@/components/ui/Slider";
import { FieldLabel } from "@/components/ui/Tooltip";
import { fieldTooltips } from "@/lib/fieldTooltips";
import type { Opportunity } from "@/types";
import type { WhiteboardTabProps } from "./types";

const discoverFields: (keyof Opportunity)[] = [
  "problem_statement",
  "target_customer_persona",
  "key_insight",
  "falsifiable_hypothesis",
  "urgency",
  "pain",
  "frequency",
  "willingness_to_pay",
  "customer_discovery_count",
  "timing_signals",
  "domain_expertise",
  "network_access",
  "unfair_insight",
  "founder_statement"
];

export function DiscoverTab({ opportunity, isReadOnly, onOpportunityChange }: WhiteboardTabProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Discover</h2>
        <EmberSectionButton opportunityId={opportunity.id} label="Fill this section" allowedFields={discoverFields} agentType="core" onUpdate={onOpportunityChange} disabled={isReadOnly} />
      </div>

      {[
        ["problem_statement", "Problem statement", 5],
        ["target_customer_persona", "Who has this problem?", 4],
        ["key_insight", "Your sharpest insight", 3],
        ["falsifiable_hypothesis", "What would prove this is real?", 3],
        ["founder_statement", "Founder statement", 3]
      ].map(([key, label, rows]) => (
        <label key={key} className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel label={label} tooltip={fieldTooltips[key as keyof typeof fieldTooltips]} />
            <EmberFieldButton opportunityId={opportunity.id} fieldKey={key as keyof Opportunity} agentType="core" onUpdate={onOpportunityChange} disabled={isReadOnly} />
          </div>
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
          <Slider label="How urgent is it for them?" tooltip={fieldTooltips.urgency} value={opportunity.urgency} disabled={isReadOnly} onChange={(urgency) => onOpportunityChange({ urgency })} />
          <Slider label="How painful is it?" tooltip={fieldTooltips.pain} value={opportunity.pain} disabled={isReadOnly} onChange={(pain) => onOpportunityChange({ pain })} />
          <Slider label="How often do they face it?" tooltip={fieldTooltips.frequency} value={opportunity.frequency} disabled={isReadOnly} onChange={(frequency) => onOpportunityChange({ frequency })} />
          <Slider
            label="Would they pay to fix it?"
            tooltip={fieldTooltips.willingness_to_pay}
            value={opportunity.willingness_to_pay}
            disabled={isReadOnly}
            onChange={(willingness_to_pay) => onOpportunityChange({ willingness_to_pay })}
          />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <DotRating label="Your domain knowledge" tooltip={fieldTooltips.domain_expertise} value={opportunity.domain_expertise} disabled={isReadOnly} onChange={(domain_expertise) => onOpportunityChange({ domain_expertise })} />
        <DotRating label="Your network in this space" tooltip={fieldTooltips.network_access} value={opportunity.network_access} disabled={isReadOnly} onChange={(network_access) => onOpportunityChange({ network_access })} />
        <DotRating label="Your unique insight" tooltip={fieldTooltips.unfair_insight} value={opportunity.unfair_insight} disabled={isReadOnly} onChange={(unfair_insight) => onOpportunityChange({ unfair_insight })} />
      </div>

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

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        <FieldLabel label="Timing signals" tooltip={fieldTooltips.timing_signals} />
        <input
          value={opportunity.timing_signals.join(", ")}
          disabled={isReadOnly}
          onChange={(event) => onOpportunityChange({ timing_signals: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
          placeholder="Regulatory change, budget pressure, behavior shift..."
          className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
        />
      </label>
    </div>
  );
}
