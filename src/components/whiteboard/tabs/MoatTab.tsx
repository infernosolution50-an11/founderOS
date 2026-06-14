import { MoatCard } from "@/components/ui/MoatCard";
import type { WhiteboardTabProps } from "./types";

export function MoatTab({ opportunity, notes, onOpportunityChange, onNotesChange, onAgentAction }: WhiteboardTabProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <MoatCard label="Network effects" value={opportunity.moat_network} colorClass="bg-os-indigo" onChange={(moat_network) => onOpportunityChange({ moat_network })} />
        <MoatCard label="Proprietary data" value={opportunity.moat_data} colorClass="bg-os-amber" onChange={(moat_data) => onOpportunityChange({ moat_data })} />
        <MoatCard label="Switching costs" value={opportunity.moat_switching} colorClass="bg-os-green" onChange={(moat_switching) => onOpportunityChange({ moat_switching })} />
        <MoatCard label="Scale economies" value={opportunity.moat_scale} colorClass="bg-os-red" onChange={(moat_scale) => onOpportunityChange({ moat_scale })} />
        <MoatCard label="Brand/trust" value={opportunity.moat_brand} colorClass="bg-purple-400" onChange={(moat_brand) => onOpportunityChange({ moat_brand })} />
        <MoatCard label="IP/patents" value={opportunity.moat_ip} colorClass="bg-teal-400" onChange={(moat_ip) => onOpportunityChange({ moat_ip })} />
      </div>

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        Moat insight
        <textarea
          value={notes.moat_insight}
          onChange={(event) => onNotesChange({ moat_insight: event.target.value })}
          rows={5}
          className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text outline-none"
        />
      </label>

      <button type="button" onClick={() => onAgentAction("Build the moat")} className="rounded-xl bg-os-indigo px-4 py-3 font-semibold text-white">
        AI analysis
      </button>
    </div>
  );
}
