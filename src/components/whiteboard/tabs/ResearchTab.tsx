import { DotRating } from "@/components/ui/DotRating";
import { PillSelector } from "@/components/ui/PillSelector";
import { Slider } from "@/components/ui/Slider";
import type { WhiteboardTabProps } from "./types";

const timingSignals = ["Regulatory change", "New technology", "Behavior shift", "Market unlock"];

export function ResearchTab({ opportunity, onOpportunityChange }: WhiteboardTabProps) {
  return (
    <div className="space-y-5">
      <section>
        <h2 className="font-display text-xl font-semibold">Problem strength</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Slider label="Urgency" value={opportunity.urgency} onChange={(urgency) => onOpportunityChange({ urgency })} />
          <Slider label="Pain level" value={opportunity.pain} onChange={(pain) => onOpportunityChange({ pain })} />
          <Slider label="Frequency" value={opportunity.frequency} onChange={(frequency) => onOpportunityChange({ frequency })} />
          <Slider
            label="Willingness to pay"
            value={opportunity.willingness_to_pay}
            onChange={(willingness_to_pay) => onOpportunityChange({ willingness_to_pay })}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Founder edge</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <DotRating
            label="Domain expertise"
            value={opportunity.domain_expertise}
            onChange={(domain_expertise) => onOpportunityChange({ domain_expertise })}
          />
          <DotRating
            label="Network access"
            value={opportunity.network_access}
            onChange={(network_access) => onOpportunityChange({ network_access })}
          />
          <DotRating
            label="Unfair insight"
            value={opportunity.unfair_insight}
            onChange={(unfair_insight) => onOpportunityChange({ unfair_insight })}
          />
        </div>
      </section>

      <PillSelector
        label="Timing signals"
        multiple
        options={timingSignals}
        value={opportunity.timing_signals}
        onChange={(timing_signals) => onOpportunityChange({ timing_signals: timing_signals as string[] })}
      />
    </div>
  );
}
