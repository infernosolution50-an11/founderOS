"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DocUpload } from "@/components/whiteboard/DocUpload";
import { EmberPanel } from "@/components/whiteboard/EmberPanel";
import { OpportunityScore } from "@/components/whiteboard/OpportunityScore";
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
  const { data, isLoading, error } = useOpportunity(opportunityId);
  const { mutateAsync: saveOpportunity } = useUpdateOpportunity(opportunityId);
  const [activeTab, setActiveTab] = useState<Tab>("Research");
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [notes, setNotes] = useState<OpportunityNotes | null>(null);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [quickAction, setQuickAction] = useState<string | null>(null);
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

    saveTimer.current = setTimeout(async () => {
      try {
        await saveOpportunity({
          ...opportunity,
          opportunity_score: score,
          notes,
          risks
        });
      } catch (saveError) {
        toast.error(saveError instanceof Error ? saveError.message : "Auto-save failed");
      }
    }, 1500);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [notes, opportunity, risks, saveOpportunity, score]);

  if (isLoading) {
    return <div className="min-h-screen bg-os-bg p-8 text-os-sub">Loading whiteboard...</div>;
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

  return (
    <div className="min-h-screen bg-os-bg text-os-text">
      <header className="sticky top-0 z-20 border-b border-os-border bg-os-bg/90 px-5 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="font-display text-xl font-bold text-os-indigo">FounderOS</div>
            <input
              value={opportunity.name}
              onChange={(event) => setOpportunity({ ...opportunity, name: event.target.value })}
              className="min-w-0 rounded-xl border border-os-border bg-os-surface px-3 py-2 font-display text-lg font-semibold text-os-text outline-none focus:border-os-indigo"
            />
          </div>
          <div className="flex items-center gap-3">
            <DocUpload compact opportunityId={opportunity.id} />
            <OpportunityScore score={score} />
          </div>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-77px)] lg:grid-cols-[52fr_48fr]">
        <section className="border-r border-os-border p-5">
          <nav className="mb-5 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  activeTab === tab ? "border-os-indigo bg-os-indigo/20 text-os-text" : "border-os-border text-os-sub hover:text-os-text"
                )}
              >
                {tab}
              </button>
            ))}
          </nav>

          {activeTab === "Research" && <ResearchTab {...tabProps} />}
          {activeTab === "Market" && <MarketTab {...tabProps} />}
          {activeTab === "Moat" && <MoatTab {...tabProps} />}
          {activeTab === "Risks" && <RisksTab {...tabProps} />}
          {activeTab === "Execute" && <ExecuteTab {...tabProps} />}
          {activeTab === "Notes" && <NotesTab {...tabProps} />}
        </section>

        <EmberPanel
          opportunityId={opportunity.id}
          initialMessages={data.messages}
          activeAgent={tabAgent[activeTab]}
          activeTab={activeTab}
          quickAction={quickAction}
          onQuickActionHandled={() => setQuickAction(null)}
        />
      </main>
    </div>
  );
}
