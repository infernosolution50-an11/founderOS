import { PillSelector } from "@/components/ui/PillSelector";
import { Slider } from "@/components/ui/Slider";
import type { Competitor, HeatLevel } from "@/types";
import type { WhiteboardTabProps } from "./types";

const models = ["SaaS", "Marketplace", "Usage-based", "Transactional", "Vertical SaaS", "Hardware+SW"];

export function MarketTab({ opportunity, onOpportunityChange, onAgentAction }: WhiteboardTabProps) {
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
      <div className="grid gap-4 md:grid-cols-3">
        {(["tam_m", "sam_m", "som_m"] as const).map((key) => (
          <label key={key} className="rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
            {key.toUpperCase()} ($M)
            <input
              type="number"
              value={opportunity[key]}
              onChange={(event) => onOpportunityChange({ [key]: Number(event.target.value) })}
              className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text outline-none"
            />
          </label>
        ))}
      </div>

      <Slider
        label="Growth rate"
        min={0}
        max={100}
        suffix="%"
        value={opportunity.growth_rate_pct}
        onChange={(growth_rate_pct) => onOpportunityChange({ growth_rate_pct })}
      />

      <PillSelector
        label="Business model"
        options={models}
        value={opportunity.business_model}
        onChange={(business_model) => onOpportunityChange({ business_model: business_model as string })}
      />

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        ACV
        <input
          value={opportunity.acv}
          onChange={(event) => onOpportunityChange({ acv: event.target.value })}
          placeholder="$12k/year"
          className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text outline-none"
        />
      </label>

      <section className="rounded-2xl border border-os-border bg-os-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Competitors</h2>
          <button
            type="button"
            onClick={() => onOpportunityChange({ competitors: [...competitors, { name: "", threat: "medium" }] })}
            className="rounded-full border border-os-border px-3 py-1 text-sm text-os-sub hover:text-os-text"
          >
            Add
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {competitors.map((competitor, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <input
                value={competitor.name}
                onChange={(event) => updateCompetitor(index, { name: event.target.value })}
                placeholder="Competitor"
                className="rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text outline-none"
              />
              <select
                value={competitor.threat}
                onChange={(event) => updateCompetitor(index, { threat: event.target.value as HeatLevel })}
                className="rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                type="button"
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
          TAM ${opportunity.tam_m}M, SAM ${opportunity.sam_m}M, SOM ${opportunity.som_m}M, growing {opportunity.growth_rate_pct}% YoY.
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
