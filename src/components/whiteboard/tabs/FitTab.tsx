import { Button } from "@/components/ui/Button";
import { DotRating } from "@/components/ui/DotRating";
import { PillSelector } from "@/components/ui/PillSelector";
import { FieldLabel } from "@/components/ui/Tooltip";
import { fieldTooltips } from "@/lib/fieldTooltips";
import type { CapitalAccess, CoFounderStatus, PriorStartupExperience } from "@/types";
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

export function FitTab({ opportunity, isReadOnly, onOpportunityChange, onFillSection }: WhiteboardTabProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Founder Fit</h2>
        <Button type="button" variant="secondary" size="sm" disabled={isReadOnly} onClick={() => onFillSection?.("Fit")}>
          Ask Ember to fill this section
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DotRating label="Domain expertise" tooltip={fieldTooltips.domain_expertise} value={opportunity.domain_expertise} disabled={isReadOnly} onChange={(domain_expertise) => onOpportunityChange({ domain_expertise })} />
        <DotRating label="Network access" tooltip={fieldTooltips.network_access} value={opportunity.network_access} disabled={isReadOnly} onChange={(network_access) => onOpportunityChange({ network_access })} />
        <DotRating label="Unfair insight" tooltip={fieldTooltips.unfair_insight} value={opportunity.unfair_insight} disabled={isReadOnly} onChange={(unfair_insight) => onOpportunityChange({ unfair_insight })} />
      </div>

      <div className="rounded-2xl border border-os-border bg-os-surface p-4">
        <FieldLabel label="Conviction" tooltip={fieldTooltips.conviction_stars} className="font-display text-os-sm font-semibold text-os-text" />
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" disabled={isReadOnly} onClick={() => onOpportunityChange({ conviction_stars: star })} className={star <= opportunity.conviction_stars ? "text-2xl text-os-amber" : "text-2xl text-os-muted"}>
              ★
            </button>
          ))}
        </div>
      </div>

      <PillSelector label="Prior startup experience" tooltip={fieldTooltips.prior_startup_experience} options={priorExperience.map((item) => item.label)} value={priorExperience.find((item) => item.value === opportunity.prior_startup_experience)?.label ?? "None"} disabled={isReadOnly} onChange={(label) => onOpportunityChange({ prior_startup_experience: priorExperience.find((item) => item.label === label)?.value ?? "none" })} />
      <PillSelector label="Co-founder status" tooltip={fieldTooltips.co_founder_status} options={coFounderStatus.map((item) => item.label)} value={coFounderStatus.find((item) => item.value === opportunity.co_founder_status)?.label ?? "Solo"} disabled={isReadOnly} onChange={(label) => onOpportunityChange({ co_founder_status: coFounderStatus.find((item) => item.label === label)?.value ?? "solo" })} />
      <PillSelector label="Capital access" tooltip={fieldTooltips.capital_access} options={capitalAccess.map((item) => item.label)} value={capitalAccess.find((item) => item.value === opportunity.capital_access)?.label ?? "Bootstrapped"} disabled={isReadOnly} onChange={(label) => onOpportunityChange({ capital_access: capitalAccess.find((item) => item.label === label)?.value ?? "bootstrapped" })} />

      <label className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
        <FieldLabel label="Founder statement" tooltip={fieldTooltips.founder_statement} />
        <textarea value={opportunity.founder_statement} disabled={isReadOnly} onChange={(event) => onOpportunityChange({ founder_statement: event.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50" />
      </label>
    </div>
  );
}

