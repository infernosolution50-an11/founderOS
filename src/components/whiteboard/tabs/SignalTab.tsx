import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/Tooltip";
import { fieldTooltips } from "@/lib/fieldTooltips";
import type { Opportunity, SignalStatus } from "@/types";
import type { WhiteboardTabProps } from "./types";

function signalStatus(opportunity: Opportunity): SignalStatus {
  if (opportunity.revenue_to_date > 0 || opportunity.pilot_customers >= 3) return "Traction";
  if (opportunity.pilot_customers > 0 || opportunity.lois_verbal_commitments >= 5) return "Strong signal";
  if (opportunity.lois_verbal_commitments > 0 || opportunity.waitlist_signups > 0) return "Early signal";
  return "No signal";
}

export function SignalTab({ opportunity, isReadOnly, onOpportunityChange, onFillSection }: WhiteboardTabProps) {
  const status = signalStatus(opportunity);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Signal</h2>
          <Badge tone={status === "Traction" || status === "Strong signal" ? "green" : status === "Early signal" ? "amber" : "neutral"} className="mt-2">
            {status}
          </Badge>
        </div>
        <Button type="button" variant="secondary" size="sm" disabled={isReadOnly} onClick={() => onFillSection?.("Signal")}>
          Ask Ember to fill this section
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <NumberField label="LOIs / verbal commitments" field="lois_verbal_commitments" tooltip={fieldTooltips.lois_verbal_commitments} opportunity={opportunity} disabled={isReadOnly} onOpportunityChange={onOpportunityChange} />
        <NumberField label="Waitlist signups" field="waitlist_signups" tooltip={fieldTooltips.waitlist_signups} opportunity={opportunity} disabled={isReadOnly} onOpportunityChange={onOpportunityChange} />
        <NumberField label="Pilot customers" field="pilot_customers" tooltip={fieldTooltips.pilot_customers} opportunity={opportunity} disabled={isReadOnly} onOpportunityChange={onOpportunityChange} />
        <NumberField label="Revenue to date ($)" field="revenue_to_date" tooltip={fieldTooltips.revenue_to_date} opportunity={opportunity} disabled={isReadOnly} onOpportunityChange={onOpportunityChange} />
      </div>

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        <FieldLabel label="Last customer conversation date" tooltip={fieldTooltips.last_customer_conversation_date} />
        <input type="date" value={opportunity.last_customer_conversation_date ?? ""} disabled={isReadOnly} onChange={(event) => onOpportunityChange({ last_customer_conversation_date: event.target.value || null })} className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50" />
      </label>

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        <FieldLabel label="Signal notes" tooltip={fieldTooltips.signal_notes} />
        <textarea value={opportunity.signal_notes} disabled={isReadOnly} onChange={(event) => onOpportunityChange({ signal_notes: event.target.value })} rows={5} className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50" />
      </label>
    </div>
  );
}

function NumberField({ label, field, tooltip, opportunity, disabled, onOpportunityChange }: { label: string; field: keyof Pick<Opportunity, "lois_verbal_commitments" | "waitlist_signups" | "pilot_customers" | "revenue_to_date">; tooltip: string; opportunity: Opportunity; disabled?: boolean; onOpportunityChange: (patch: Partial<Opportunity>) => void }) {
  return (
    <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
      <FieldLabel label={label} tooltip={tooltip} />
      <input type="number" min={0} value={Number(opportunity[field] ?? 0)} disabled={disabled} onChange={(event) => onOpportunityChange({ [field]: Number(event.target.value) })} className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50" />
    </label>
  );
}

