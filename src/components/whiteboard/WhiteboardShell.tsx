"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, MessageCircle, PanelRightOpen, Upload } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { DocUpload } from "@/components/whiteboard/DocUpload";
import { EmberPanel } from "@/components/whiteboard/EmberPanel";
import { OpportunityScore } from "@/components/whiteboard/OpportunityScore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { ExecuteTab } from "@/components/whiteboard/tabs/ExecuteTab";
import { FitTab } from "@/components/whiteboard/tabs/FitTab";
import { MarketTab } from "@/components/whiteboard/tabs/MarketTab";
import { MoatTab } from "@/components/whiteboard/tabs/MoatTab";
import { NotesTab } from "@/components/whiteboard/tabs/NotesTab";
import { ResearchTab } from "@/components/whiteboard/tabs/ResearchTab";
import { RisksTab } from "@/components/whiteboard/tabs/RisksTab";
import { SignalTab } from "@/components/whiteboard/tabs/SignalTab";
import { useCreateOpportunity, useOpportunity, useUpdateOpportunity } from "@/hooks/useOpportunity";
import { calculateOpportunityScore } from "@/lib/score";
import { cn } from "@/lib/utils";
import type { AgentType, Milestone, Opportunity, OpportunityNotes, RiskAssessment } from "@/types";

const tabs = ["Research", "Market", "Moat", "Risks", "Execute", "Notes", "Fit", "Signal"] as const;
type Tab = (typeof tabs)[number];
type MobilePanel = "whiteboard" | "ember" | "docs";

const tabAgent: Record<Tab, AgentType> = {
  Research: "core",
  Market: "market",
  Moat: "moat",
  Risks: "risk",
  Execute: "execution",
  Notes: "core",
  Fit: "core",
  Signal: "market"
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
    decision_log: [],
    updated_at: new Date().toISOString()
  };
}

export function WhiteboardShell({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useOpportunity(opportunityId);
  const { mutateAsync: saveOpportunity } = useUpdateOpportunity(opportunityId);
  const createOpportunity = useCreateOpportunity();
  const [activeTab, setActiveTab] = useState<Tab>("Research");
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [notes, setNotes] = useState<OpportunityNotes | null>(null);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [quickAction, setQuickAction] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("whiteboard");
  const [isEmberCollapsed, setIsEmberCollapsed] = useState(false);
  const [autofillIdea, setAutofillIdea] = useState("");
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [dirtyVersion, setDirtyVersion] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didHydrate = useRef(false);
  const changeVersion = useRef(0);
  const savedVersion = useRef(0);

  useEffect(() => {
    if (!data) return;
    if (changeVersion.current !== savedVersion.current) return;
    setOpportunity(data.opportunity);
    setNotes(data.notes ?? emptyNotes(data.opportunity));
    setRisks(data.risks);
    setMilestones(data.milestones);
    didHydrate.current = true;
    setSaveStatus("saved");
  }, [data]);

  useEffect(() => {
    const value = window.localStorage.getItem(`founderos:ember-collapsed:${opportunityId}`);
    setIsEmberCollapsed(value === "true");
  }, [opportunityId]);

  useEffect(() => {
    window.localStorage.setItem(`founderos:ember-collapsed:${opportunityId}`, String(isEmberCollapsed));
  }, [isEmberCollapsed, opportunityId]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
        event.preventDefault();
        setIsEmberCollapsed((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function markDirty() {
    changeVersion.current += 1;
    setDirtyVersion(changeVersion.current);
  }

  const score = useMemo(() => {
    if (!opportunity) return 0;
    return calculateOpportunityScore(opportunity, risks, data?.tasks ?? [], milestones);
  }, [opportunity, risks, data?.tasks, milestones]);

  useEffect(() => {
    if (!didHydrate.current || !opportunity || !notes) return;
    if (opportunity.is_demo) {
      setSaveStatus("saved");
      return;
    }
    if (dirtyVersion === savedVersion.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");

    saveTimer.current = setTimeout(async () => {
      const versionToSave = dirtyVersion;
      try {
        await saveOpportunity({
          ...opportunity,
          opportunity_score: score,
          notes,
          risks,
          milestones
        });
        savedVersion.current = Math.max(savedVersion.current, versionToSave);
        setSaveStatus(changeVersion.current === versionToSave ? "saved" : "saving");
      } catch (saveError) {
        setSaveStatus("error");
        toast.error(saveError instanceof Error ? saveError.message : "Couldn't save — tap to retry", () => {
          setOpportunity((current) => (current ? { ...current } : current));
          markDirty();
        });
      }
    }, 1500);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [dirtyVersion, milestones, notes, opportunity, risks, saveOpportunity, score]);

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

  const isReadOnly = Boolean(opportunity.is_demo);
  async function copyDemoToWorkspace() {
    const sourceDemoId = opportunity?.id;
    if (!opportunity?.is_demo || !sourceDemoId) return;
    try {
      const result = await createOpportunity.mutateAsync({ sourceDemoId });
      toast.success("Demo copied to your workspace.");
      router.push(`/opportunity/${result.opportunity.id}`);
    } catch (copyError) {
      toast.error(copyError instanceof Error ? copyError.message : "Could not copy demo.");
    }
  }

  function applyEmberPatch(payload: unknown) {
    if (!opportunity) return;
    if (!payload || typeof payload !== "object") return;
    const patch = payload as Record<string, unknown>;
    const fields = (patch.fields && typeof patch.fields === "object" ? patch.fields : patch) as Record<string, unknown>;
    let updated = 0;

    function unwrapValues(section: unknown) {
      if (!section || typeof section !== "object" || Array.isArray(section)) return {};
      return Object.fromEntries(
        Object.entries(section as Record<string, unknown>).map(([key, value]) => [
          key,
          value && typeof value === "object" && "value" in value ? (value as { value: unknown }).value : value
        ])
      );
    }

    const opportunityPatch = unwrapValues(fields.opportunity);
    if (Object.keys(opportunityPatch).length > 0) {
      markDirty();
      setOpportunity((current) => (current ? { ...current, ...opportunityPatch } : current));
      updated += Object.keys(opportunityPatch).length;
    }

    const notesPatch = unwrapValues(fields.notes);
    if (Object.keys(notesPatch).length > 0) {
      markDirty();
      setNotes((current) => (current ? { ...current, ...notesPatch } : current));
      updated += Object.keys(notesPatch).length;
    }

    if (Array.isArray(fields.risks)) {
      markDirty();
      setRisks(fields.risks as RiskAssessment[]);
      updated += fields.risks.length;
    }

    if (Array.isArray(fields.milestones)) {
      markDirty();
      setMilestones(
        (fields.milestones as Array<Partial<Milestone>>).map((milestone) => ({
          id: milestone.id ?? crypto.randomUUID(),
          opportunity_id: opportunity.id,
          user_id: opportunity.user_id,
          title: milestone.title ?? "Untitled milestone",
          target_date: milestone.target_date ?? null,
          done: Boolean(milestone.done),
          created_at: milestone.created_at ?? new Date().toISOString()
        }))
      );
      updated += fields.milestones.length;
    }

    if (updated > 0) {
      toast.success(`Ember updated ${updated} fields — review and adjust.`);
    }
  }

  async function fillSection(section: string) {
    if (isReadOnly || !opportunity) return;
    try {
      const response = await fetch("/api/ember/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opportunity.id, action: "fill_section", section })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Could not fill this section.");
      applyEmberPatch(payload.fill);
    } catch (fillError) {
      toast.error(fillError instanceof Error ? fillError.message : "Could not fill this section.");
    }
  }

  async function runAutofill() {
    if (!autofillIdea.trim() || isReadOnly || !opportunity) return;
    setIsAutofilling(true);
    try {
      const response = await fetch("/api/ember/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityName: opportunity.name, idea: autofillIdea })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Could not autofill this opportunity.");
      applyEmberPatch(payload.autofill);
      setAutofillIdea("");
    } catch (autofillError) {
      toast.error(autofillError instanceof Error ? autofillError.message : "Could not autofill this opportunity.");
    } finally {
      setIsAutofilling(false);
    }
  }

  const tabProps = {
    opportunity: { ...opportunity, opportunity_score: score },
    notes,
    risks,
    milestones,
    tasks: data.tasks,
    documents: data.documents,
    isReadOnly,
    onOpportunityChange: (patch: Partial<Opportunity>) => {
      if (!isReadOnly) {
        markDirty();
        setOpportunity((current) => (current ? { ...current, ...patch } : current));
      }
    },
    onNotesChange: (patch: Partial<OpportunityNotes>) => {
      if (!isReadOnly) {
        markDirty();
        setNotes((current) => (current ? { ...current, ...patch } : current));
      }
    },
    onRisksChange: (nextRisks: RiskAssessment[]) => {
      if (!isReadOnly) {
        markDirty();
        setRisks(nextRisks);
      }
    },
    onMilestonesChange: (nextMilestones: Milestone[]) => {
      if (!isReadOnly) {
        markDirty();
        setMilestones(nextMilestones);
      }
    },
    onAgentAction: (message: string) => {
      if (!isReadOnly) setQuickAction(message);
    },
    onFillSection: fillSection,
    onDocumentsChanged: async () => {
      await refetch();
    }
  };

  const hasEarlySignal =
    [opportunity.urgency, opportunity.pain, opportunity.frequency, opportunity.willingness_to_pay].filter((value) => value !== 5).length >= 2 ||
    opportunity.timing_signals.length > 0;

  const activeTabContent = (
    <div className={cn("animate-fade-in", isReadOnly && "pointer-events-none opacity-75")}>
      {activeTab === "Research" && <ResearchTab {...tabProps} />}
      {activeTab === "Market" && <MarketTab {...tabProps} />}
      {activeTab === "Moat" && <MoatTab {...tabProps} />}
      {activeTab === "Risks" && <RisksTab {...tabProps} />}
      {activeTab === "Execute" && <ExecuteTab {...tabProps} />}
      {activeTab === "Notes" && <NotesTab {...tabProps} />}
      {activeTab === "Fit" && <FitTab {...tabProps} />}
      {activeTab === "Signal" && <SignalTab {...tabProps} />}
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
      readOnly={isReadOnly}
      onFieldUpdates={applyEmberPatch}
      onCollapse={() => setIsEmberCollapsed(true)}
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
            <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-os-md px-2 text-os-sm text-os-sub hover:bg-os-panel hover:text-os-text">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>
            <input
              aria-label="Opportunity name"
              value={opportunity.name}
              onChange={(event) => {
                if (!isReadOnly) {
                  markDirty();
                  setOpportunity({ ...opportunity, name: event.target.value });
                }
              }}
              disabled={isReadOnly}
              className="h-11 min-w-0 rounded-os-md border border-os-border bg-os-surface px-3 font-display text-base font-semibold text-os-text focus:border-os-indigo disabled:opacity-80 md:h-9 md:text-lg"
            />
          </div>
          <div className="flex items-center gap-3">
            {isReadOnly && <Badge tone="indigo">Shared demo</Badge>}
            <Badge tone={isReadOnly ? "indigo" : saveStatus === "error" ? "red" : saveStatus === "saving" ? "amber" : "green"} className="gap-2">
              {saveStatus === "saving" ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : <Check className="h-3 w-3" aria-hidden="true" />}
              {isReadOnly ? "Read-only" : saveStatus === "saving" ? "Saving..." : saveStatus === "error" ? "Save failed" : "Saved"}
            </Badge>
            {isReadOnly && (
              <Button type="button" variant="primary" size="sm" loading={createOpportunity.isPending} onClick={copyDemoToWorkspace}>
                Copy to my workspace
              </Button>
            )}
            <DocUpload compact opportunityId={opportunity.id} disabled={isReadOnly} onSynthesized={() => refetch()} />
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

      <main className={cn("min-h-[calc(100vh-77px)] transition-all duration-300 lg:grid", isEmberCollapsed ? "lg:grid-cols-1" : "lg:grid-cols-[52fr_48fr]")}>
        <section className={cn("border-r border-os-border p-4 md:p-5", mobilePanel !== "whiteboard" && "hidden lg:block")}>
          <Tabs items={tabs.map((tab) => ({ value: tab, label: tab }))} value={activeTab} onChange={setActiveTab} className="mb-5" />
          {isReadOnly && (
            <div className="mb-5 rounded-os-md border border-os-indigo/40 bg-os-indigo/10 p-4">
              <p className="text-os-sm text-os-text">This shared demo is read-only for everyone. Copy it to your workspace to edit fields, upload documents, create tasks, or chat with Ember.</p>
              <Button type="button" variant="primary" size="md" className="mt-3" loading={createOpportunity.isPending} onClick={copyDemoToWorkspace}>
                Copy to my workspace
              </Button>
            </div>
          )}
          {!isReadOnly && hasEarlySignal && activeTab === "Research" && (
            <div className="mb-5 rounded-os-md border border-os-indigo/40 bg-os-indigo/10 p-4">
              <p className="text-os-sm text-os-text">You have enough signal for Ember to pressure-test the market angle.</p>
              <Button type="button" variant="primary" size="md" className="mt-3" onClick={() => setQuickAction("Based on what I've entered, analyze the market opportunity")}>
                Ask Ember about the market opportunity
              </Button>
            </div>
          )}
          {!isReadOnly && (
            <div className="mb-5 rounded-os-md border border-os-border bg-os-surface p-4">
              <p className="font-display text-sm font-semibold text-os-text">Let Ember fill this</p>
              <p className="mt-1 text-os-sm text-os-sub">Describe your idea in 1-3 sentences and Ember will fill in a starting point for every field.</p>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={autofillIdea}
                  onChange={(event) => setAutofillIdea(event.target.value)}
                  placeholder="Example: AI copilot that helps finance teams approve SaaS purchases in Slack..."
                  className="rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo"
                />
                <Button type="button" variant="primary" size="md" loading={isAutofilling} disabled={!autofillIdea.trim() || isAutofilling} onClick={runAutofill}>
                  Let Ember fill this
                </Button>
              </div>
            </div>
          )}
          {activeTabContent}
        </section>

        <div className={cn(mobilePanel !== "ember" && "hidden lg:block", isEmberCollapsed && "lg:hidden")}>{emberPanel}</div>
        <section className={cn("p-4 md:p-5 lg:hidden", mobilePanel !== "docs" && "hidden")}>
          <DocUpload opportunityId={opportunity.id} disabled={isReadOnly} onSynthesized={() => refetch()} />
        </section>
      </main>
      {isEmberCollapsed && (
        <Button
          type="button"
          variant="primary"
          size="md"
          className="fixed bottom-5 right-5 z-30 hidden rounded-full shadow-os-lg lg:inline-flex"
          onClick={() => setIsEmberCollapsed(false)}
          leftIcon={<PanelRightOpen className="h-4 w-4" aria-hidden="true" />}
        >
          Open Ember
        </Button>
      )}
    </div>
  );
}
