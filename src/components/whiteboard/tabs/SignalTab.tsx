import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PillSelector } from "@/components/ui/PillSelector";
import { FieldLabel } from "@/components/ui/Tooltip";
import { fieldTooltips } from "@/lib/fieldTooltips";
import type { CapitalAccess, CoFounderStatus, Opportunity, PriorStartupExperience, SignalStatus } from "@/types";
import type { WhiteboardTabProps } from "./types";

const priorExperience: Array<{ label: string; value: PriorStartupExperience }> = [
  { label: "None", value: "none" },
  { label: "1 exit", value: "one_exit" },
  { label: "Multiple exits", value: "multiple_exits" },
  { label: "Currently operating", value: "currently_operating" }
];
const coFounderStatus: Array<{ label: string; value: CoFounderStatus }> = [
  { label: "Solo", value: "solo" },
  { label: "Co-founder found", value: "co_founder_found" },
  { label: "Team assembled", value: "team_assembled" }
];
const capitalAccess: Array<{ label: string; value: CapitalAccess }> = [
  { label: "Bootstrapped", value: "bootstrapped" },
  { label: "Friends & family", value: "friends_family" },
  { label: "Seeking seed", value: "seeking_seed" },
  { label: "Funded", value: "funded" }
];

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

      <section className="rounded-2xl border border-os-border bg-os-surface p-4">
        <FieldLabel label="Your conviction (1-5)" tooltip={fieldTooltips.conviction_stars} className="font-display text-os-sm font-semibold text-os-text" />
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" disabled={isReadOnly} onClick={() => onOpportunityChange({ conviction_stars: star })} className={star <= opportunity.conviction_stars ? "text-2xl text-os-amber" : "text-2xl text-os-muted"}>
              ★
            </button>
          ))}
        </div>
      </section>

      <PillSelector label="Your startup background" tooltip={fieldTooltips.prior_startup_experience} options={priorExperience.map((item) => item.label)} value={priorExperience.find((item) => item.value === opportunity.prior_startup_experience)?.label ?? "None"} disabled={isReadOnly} onChange={(label) => onOpportunityChange({ prior_startup_experience: priorExperience.find((item) => item.label === label)?.value ?? "none" })} />
      <PillSelector label="Team status" tooltip={fieldTooltips.co_founder_status} options={coFounderStatus.map((item) => item.label)} value={coFounderStatus.find((item) => item.value === opportunity.co_founder_status)?.label ?? "Solo"} disabled={isReadOnly} onChange={(label) => onOpportunityChange({ co_founder_status: coFounderStatus.find((item) => item.label === label)?.value ?? "solo" })} />
      <PillSelector label="Funding situation" tooltip={fieldTooltips.capital_access} options={capitalAccess.map((item) => item.label)} value={capitalAccess.find((item) => item.value === opportunity.capital_access)?.label ?? "Bootstrapped"} disabled={isReadOnly} onChange={(label) => onOpportunityChange({ capital_access: capitalAccess.find((item) => item.label === label)?.value ?? "bootstrapped" })} />
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

