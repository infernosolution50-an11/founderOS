import { PillSelector } from "@/components/ui/PillSelector";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/Tooltip";
import { fieldTooltips } from "@/lib/fieldTooltips";
import type { Competitor, HeatLevel, MarketType } from "@/types";
import type { WhiteboardTabProps } from "./types";

const models = ["SaaS", "Marketplace", "Usage-based", "Transactional", "Vertical SaaS", "Hardware+SW"];
const marketTypes: Array<{ label: string; value: MarketType }> = [
  { label: "New Market", value: "new_market" },
  { label: "Existing Market", value: "existing_market" },
  { label: "Re-segmented Market", value: "resegmented_market" },
  { label: "Clone Market", value: "clone_market" }
];
const timingSignals = ["Regulatory change", "New technology", "Behavior shift", "Market unlock", "Budget pressure"];
const marketSizeLabels = {
  tam_m: "Total market size (rough $M)",
  sam_m: "Reachable market ($M)",
  som_m: "Your realistic slice ($M)"
} as const;

export function MarketTab({ opportunity, isReadOnly, onOpportunityChange, onAgentAction, onFillSection }: WhiteboardTabProps) {
  const competitors = opportunity.competitors ?? [];

  function updateCompetitor(index: number, patch: Partial<Competitor>) {
    onOpportunityChange({
      competitors: competitors.map((competitor, competitorIndex) =>
        competitorIndex === index ? { ...competitor, ...patch } : competitor
      )
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Market</h2>
        <Button type="button" variant="secondary" size="sm" disabled={isReadOnly} onClick={() => onFillSection?.("Market")}>
          Ask Ember to fill this section
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(["tam_m", "sam_m", "som_m"] as const).map((key) => (
          <label key={key} className="rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
            <FieldLabel label={marketSizeLabels[key]} tooltip={fieldTooltips[key]} />
            <input
              type="number"
              value={opportunity[key]}
              disabled={isReadOnly}
              onChange={(event) => onOpportunityChange({ [key]: Number(event.target.value) })}
              className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
            />
          </label>
        ))}
      </div>

      <Slider
        label="Growth rate"
        min={0}
        max={100}
        suffix="%"
        tooltip={fieldTooltips.growth_rate_pct}
        value={opportunity.growth_rate_pct}
        disabled={isReadOnly}
        onChange={(growth_rate_pct) => onOpportunityChange({ growth_rate_pct })}
      />

      <PillSelector
        label="Market type"
        tooltip={fieldTooltips.market_type}
        options={marketTypes.map((type) => type.label)}
        value={marketTypes.find((type) => type.value === opportunity.market_type)?.label ?? "Existing Market"}
        disabled={isReadOnly}
        onChange={(label) => onOpportunityChange({ market_type: marketTypes.find((type) => type.label === label)?.value ?? "existing_market" })}
      />

      <PillSelector
        label="Timing signals"
        tooltip={fieldTooltips.timing_signals}
        multiple
        options={timingSignals}
        value={opportunity.timing_signals}
        disabled={isReadOnly}
        onChange={(timing_signals) => onOpportunityChange({ timing_signals: timing_signals as string[] })}
      />

      <PillSelector
        label="Business model"
        options={models}
        value={opportunity.business_model}
        disabled={isReadOnly}
        onChange={(business_model) => onOpportunityChange({ business_model: business_model as string })}
      />

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        <FieldLabel label="Pricing model" tooltip={fieldTooltips.pricing_model} />
        <input
          value={opportunity.pricing_model}
          disabled={isReadOnly}
          onChange={(event) => onOpportunityChange({ pricing_model: event.target.value })}
          placeholder="Monthly SaaS, usage-based, services..."
          className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
        />
      </label>

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        <FieldLabel label="ACV estimate" tooltip={fieldTooltips.acv} />
        <input
          value={opportunity.acv}
          disabled={isReadOnly}
          onChange={(event) => onOpportunityChange({ acv: event.target.value })}
          placeholder="$12k/year"
          className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
        />
      </label>

      <section className="rounded-2xl border border-os-border bg-os-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Competitors</h2>
          <button
            type="button"
            disabled={isReadOnly}
            onClick={() => onOpportunityChange({ competitors: [...competitors, { name: "", threat: "medium", differentiator: "", estimated_arr: "" }] })}
            className="rounded-full border border-os-border px-3 py-1 text-sm text-os-sub hover:text-os-text"
          >
            Add
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {competitors.map((competitor, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1fr_auto_1fr_1fr_auto]">
              <input
                value={competitor.name}
                disabled={isReadOnly}
                onChange={(event) => updateCompetitor(index, { name: event.target.value })}
                placeholder="Competitor"
                className="rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
              />
              <select
                value={competitor.threat}
                disabled={isReadOnly}
                onChange={(event) => updateCompetitor(index, { threat: event.target.value as HeatLevel })}
                className="rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                value={competitor.differentiator ?? ""}
                disabled={isReadOnly}
                onChange={(event) => updateCompetitor(index, { differentiator: event.target.value })}
                placeholder="Differentiator"
                className="rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
              />
              <input
                value={competitor.estimated_arr ?? ""}
                disabled={isReadOnly}
                onChange={(event) => updateCompetitor(index, { estimated_arr: event.target.value })}
                placeholder="Estimated ARR"
                className="rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
              />
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => onOpportunityChange({ competitors: competitors.filter((_, competitorIndex) => competitorIndex !== index) })}
                className="rounded-xl border border-os-border px-3 py-2 text-sm text-os-muted hover:text-os-red"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-os-indigo/40 bg-os-indigo/10 p-4">
        <h3 className="font-display text-lg font-semibold">Market snapshot</h3>
        <p className="mt-2 text-sm text-os-sub">
          Total market ${opportunity.tam_m}M, reachable market ${opportunity.sam_m}M, realistic slice ${opportunity.som_m}M, growing {opportunity.growth_rate_pct}% YoY.
        </p>
        <button
          type="button"
          onClick={() => onAgentAction("Analyze this market")}
          className="mt-4 rounded-xl bg-os-indigo px-4 py-2 text-sm font-semibold text-white"
        >
          Analyze this market
        </button>
      </div>
    </div>
  );
}
