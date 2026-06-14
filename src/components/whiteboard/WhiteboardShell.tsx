"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, MessageCircle, Upload } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { DocUpload } from "@/components/whiteboard/DocUpload";
import { EmberPanel } from "@/components/whiteboard/EmberPanel";
import { OpportunityScore } from "@/components/whiteboard/OpportunityScore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { ExecuteTab } from "@/components/whiteboard/tabs/ExecuteTab";
import { MarketTab } from "@/components/whiteboard/tabs/MarketTab";
import { MoatTab } from "@/components/whiteboard/tabs/MoatTab";
import { NotesTab } from "@/components/whiteboard/tabs/NotesTab";
import { ResearchTab } from "@/components/whiteboard/tabs/ResearchTab";
import { RisksTab } from "@/components/whiteboard/tabs/RisksTab";
import { useOpportunity, useUpdateOpportunity } from "@/hooks/useOpportunity";
import { calculateOpportunityScore } from "@/lib/score";
import { cn } from "@/lib/utils";
import type { AgentType, Opportunity, OpportunityNotes, RiskAssessment } from "@/types";

const tabs = ["Research", "Market", "Moat", "Risks", "Execute", "Notes"] as const;
type Tab = (typeof tabs)[number];
type MobilePanel = "whiteboard" | "ember" | "docs";

const tabAgent: Record<Tab, AgentType> = {
  Research: "core",
  Market: "market",
  Moat: "moat",
  Risks: "risk",
  Execute: "execution",
  Notes: "core"
};

function emptyNotes(opportunity: Opportunity): OpportunityNotes {
  return {
    id: "local",
    opportunity_id: opportunity.id,
    user_id: opportunity.user_id,
    thesis: "",
    customer_notes: "",
    open_questions: "",
    kill_conditions: "",
    moat_insight: "",
    updated_at: new Date().toISOString()
  };
}

export function WhiteboardShell({ opportunityId }: { opportunityId: string }) {
  const { data, isLoading, error, refetch } = useOpportunity(opportunityId);
  const { mutateAsync: saveOpportunity } = useUpdateOpportunity(opportunityId);
  const [activeTab, setActiveTab] = useState<Tab>("Research");
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [notes, setNotes] = useState<OpportunityNotes | null>(null);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [quickAction, setQuickAction] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("whiteboard");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didHydrate = useRef(false);

  useEffect(() => {
    if (!data) return;
    setOpportunity(data.opportunity);
    setNotes(data.notes ?? emptyNotes(data.opportunity));
    setRisks(data.risks);
    didHydrate.current = true;
  }, [data]);

  const score = useMemo(() => {
    if (!opportunity) return 0;
    return calculateOpportunityScore(opportunity, risks, data?.tasks ?? []);
  }, [opportunity, risks, data?.tasks]);

  useEffect(() => {
    if (!didHydrate.current || !opportunity || !notes) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");

    saveTimer.current = setTimeout(async () => {
      try {
        await saveOpportunity({
          ...opportunity,
          opportunity_score: score,
          notes,
          risks
        });
        setSaveStatus("saved");
      } catch (saveError) {
        setSaveStatus("error");
        toast.error(saveError instanceof Error ? saveError.message : "Couldn't save — tap to retry", () => {
          setOpportunity((current) => (current ? { ...current } : current));
        });
      }
    }, 1500);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [notes, opportunity, risks, saveOpportunity, score]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-os-bg p-4 md:p-8">
        <Skeleton className="h-14 w-full rounded-os-lg" />
        <div className="mt-5 grid gap-5 lg:grid-cols-[52fr_48fr]">
          <Skeleton shape="full" />
          <Skeleton shape="full" />
        </div>
      </div>
    );
  }

  if (error || !opportunity || !notes || !data) {
    return <div className="min-h-screen bg-os-bg p-8 text-os-red">Unable to load this opportunity.</div>;
  }

  const tabProps = {
    opportunity: { ...opportunity, opportunity_score: score },
    notes,
    risks,
    tasks: data.tasks,
    documents: data.documents,
    onOpportunityChange: (patch: Partial<Opportunity>) => setOpportunity((current) => (current ? { ...current, ...patch } : current)),
    onNotesChange: (patch: Partial<OpportunityNotes>) => setNotes((current) => (current ? { ...current, ...patch } : current)),
    onRisksChange: setRisks,
    onAgentAction: setQuickAction
  };

  const hasEarlySignal =
    [opportunity.urgency, opportunity.pain, opportunity.frequency, opportunity.willingness_to_pay].filter((value) => value !== 5).length >= 2 ||
    opportunity.timing_signals.length > 0;

  const activeTabContent = (
    <div className="animate-fade-in">
      {activeTab === "Research" && <ResearchTab {...tabProps} />}
      {activeTab === "Market" && <MarketTab {...tabProps} />}
      {activeTab === "Moat" && <MoatTab {...tabProps} />}
      {activeTab === "Risks" && <RisksTab {...tabProps} />}
      {activeTab === "Execute" && <ExecuteTab {...tabProps} />}
      {activeTab === "Notes" && <NotesTab {...tabProps} />}
    </div>
  );

  const emberPanel = (
    <EmberPanel
      opportunityId={opportunity.id}
      initialMessages={data.messages}
      activeAgent={tabAgent[activeTab]}
      activeTab={activeTab}
      quickAction={quickAction}
      onQuickActionHandled={() => setQuickAction(null)}
      onRefresh={async () => {
        await refetch();
      }}
    />
  );

  return (
    <div className="min-h-screen bg-os-bg text-os-text">
      <header className="sticky top-0 z-20 border-b border-os-border bg-os-bg/90 px-4 py-3 backdrop-blur md:px-5 md:py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="font-display text-lg font-semibold text-os-indigo md:text-xl">FounderOS</div>
            <input
              aria-label="Opportunity name"
              value={opportunity.name}
              onChange={(event) => setOpportunity({ ...opportunity, name: event.target.value })}
              className="h-11 min-w-0 rounded-os-md border border-os-border bg-os-surface px-3 font-display text-base font-semibold text-os-text focus:border-os-indigo md:h-9 md:text-lg"
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={saveStatus === "error" ? "red" : saveStatus === "saving" ? "amber" : "green"} className="gap-2">
              {saveStatus === "saving" ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : <Check className="h-3 w-3" aria-hidden="true" />}
              {saveStatus === "saving" ? "Saving..." : saveStatus === "error" ? "Save failed" : "Saved"}
            </Badge>
            <DocUpload compact opportunityId={opportunity.id} />
            <OpportunityScore score={score} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 border-b border-os-border bg-os-surface p-2 lg:hidden">
        {[
          ["whiteboard", "Whiteboard", MessageCircle],
          ["ember", "Ember", MessageCircle],
          ["docs", "Docs", Upload]
        ].map(([value, label, Icon]) => (
          <Button
            key={value as string}
            type="button"
            variant={mobilePanel === value ? "primary" : "secondary"}
            size="md"
            onClick={() => setMobilePanel(value as MobilePanel)}
            leftIcon={<Icon className="h-4 w-4" aria-hidden="true" />}
          >
            {label as string}
          </Button>
        ))}
      </div>

      <main className="min-h-[calc(100vh-77px)] lg:grid lg:grid-cols-[52fr_48fr]">
        <section className={cn("border-r border-os-border p-4 md:p-5", mobilePanel !== "whiteboard" && "hidden lg:block")}>
          <Tabs items={tabs.map((tab) => ({ value: tab, label: tab }))} value={activeTab} onChange={setActiveTab} className="mb-5" />
          {hasEarlySignal && activeTab === "Research" && (
            <div className="mb-5 rounded-os-md border border-os-indigo/40 bg-os-indigo/10 p-4">
              <p className="text-os-sm text-os-text">You have enough signal for Ember to pressure-test the market angle.</p>
              <Button type="button" variant="primary" size="md" className="mt-3" onClick={() => setQuickAction("Based on what I've entered, analyze the market opportunity")}>
                Ask Ember about the market opportunity
              </Button>
            </div>
          )}
          {activeTabContent}
        </section>

        <div className={cn(mobilePanel !== "ember" && "hidden lg:block")}>{emberPanel}</div>
        <section className={cn("p-4 md:p-5 lg:hidden", mobilePanel !== "docs" && "hidden")}>
          <DocUpload opportunityId={opportunity.id} />
        </section>
      </main>
    </div>
  );
}
