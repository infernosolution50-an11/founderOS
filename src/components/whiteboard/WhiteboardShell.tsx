"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, MessageCircle, StickyNote, Upload } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { DocUpload } from "@/components/whiteboard/DocUpload";
import { EmberPanel } from "@/components/whiteboard/EmberPanel";
import { NotesDrawer } from "@/components/whiteboard/NotesDrawer";
import { OpportunityScore } from "@/components/whiteboard/OpportunityScore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { BuildTab } from "@/components/whiteboard/tabs/BuildTab";
import { DiscoverTab } from "@/components/whiteboard/tabs/DiscoverTab";
import { MarketTab } from "@/components/whiteboard/tabs/MarketTab";
import { RisksTab } from "@/components/whiteboard/tabs/RisksTab";
import { SignalTab } from "@/components/whiteboard/tabs/SignalTab";
import { useAutofill } from "@/hooks/useAutofill";
import { useCreateOpportunity } from "@/hooks/useOpportunity";
import { type MobilePanel, useWhiteboardState } from "@/hooks/useWhiteboardState";
import { cn } from "@/lib/utils";
import type { AgentType, DocumentRecord } from "@/types";
const tabs = ["Discover", "Market", "Build", "Risks", "Signal"] as const;
type Tab = (typeof tabs)[number];

const tabAgent: Record<Tab, AgentType> = {
  Discover: "core",
  Market: "market",
  Build: "execution",
  Risks: "risk",
  Signal: "market"
};

export function WhiteboardShell({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const createOpportunity = useCreateOpportunity();
  const [activeTab, setActiveTab] = useState<Tab>("Discover");
  const [quickAction, setQuickAction] = useState<string | null>(null);
  const [isEmberOpen, setIsEmberOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [pendingDocumentAction, setPendingDocumentAction] = useState<DocumentRecord | null>(null);
  const state = useWhiteboardState(opportunityId);
  const { data, isLoading, error, refetch, opportunity, notes, risks, milestones, mobilePanel, setMobilePanel, saveStatus, score, isReadOnly, lowConfidenceFields, hasEarlySignal, applyEmberPatch, onOpportunityChange, onNotesChange, onRisksChange, onMilestonesChange } = state;
  const { autofillIdea, setAutofillIdea, isAutofilling, emberAction, handleAutofill, handleEmberAction } = useAutofill({
    opportunityId,
    opportunityName: opportunity?.name ?? "",
    isReadOnly,
    onFieldsUpdated: applyEmberPatch,
    onTasksChanged: async () => {
      await refetch();
    }
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
        event.preventDefault();
        setIsEmberOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (isLoading) return <LoadingWhiteboard />;
  if (error || !opportunity || !notes || !data) return <div className="min-h-screen bg-os-bg p-8 text-os-red">Unable to load this opportunity.</div>;

  async function copyDemoToWorkspace() {
    if (!opportunity?.is_demo) return;
    try {
      const result = await createOpportunity.mutateAsync({ sourceDemoId: opportunity.id });
      toast.success("Demo copied to your workspace.");
      router.push(`/opportunity/${result.opportunity.id}`);
    } catch (copyError) {
      toast.error(copyError instanceof Error ? copyError.message : "Could not copy demo.");
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
    onOpportunityChange,
    onNotesChange,
    onRisksChange,
    onMilestonesChange,
    onAgentAction: (message: string) => {
      if (!isReadOnly) {
        setQuickAction(message);
        setIsEmberOpen(true);
      }
    },
    onFillSection: handleEmberAction,
    onFieldUpdates: applyEmberPatch,
    onDocumentsChanged: async () => {
      await refetch();
    }
  };

  const activeTabContent = (
    <div className={cn("animate-fade-in", isReadOnly && "pointer-events-none opacity-75")}>
      {activeTab === "Discover" && <DiscoverTab {...tabProps} />}
      {activeTab === "Market" && <MarketTab {...tabProps} />}
      {activeTab === "Build" && <BuildTab {...tabProps} />}
      {activeTab === "Risks" && <RisksTab {...tabProps} />}
      {activeTab === "Signal" && <SignalTab {...tabProps} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-os-bg text-os-text">
      <Header opportunityName={opportunity.name} isReadOnly={isReadOnly} saveStatus={saveStatus} score={score} copyPending={createOpportunity.isPending} onNameChange={(name) => onOpportunityChange({ name })} onCopy={copyDemoToWorkspace} onOpenEmber={() => setIsEmberOpen(true)} onOpenNotes={() => setIsNotesOpen(true)} upload={<DocUpload compact opportunityId={opportunity.id} disabled={isReadOnly} onSynthesized={() => refetch()} onFieldUpdates={applyEmberPatch} onPendingDocumentActionChange={(document) => { setPendingDocumentAction(document); if (document) setIsNotesOpen(true); }} />} />
      <MobileSwitcher value={mobilePanel} onChange={setMobilePanel} />
      <main className="min-h-[calc(100vh-77px)]">
        <section className={cn("p-4 md:p-5", mobilePanel !== "whiteboard" && "hidden lg:block")}>
          <Tabs items={tabs.map((tab) => ({ value: tab, label: tab }))} value={activeTab} onChange={setActiveTab} className="mb-5" />
          {isReadOnly ? <ReadOnlyNotice loading={createOpportunity.isPending} onCopy={copyDemoToWorkspace} /> : <EmberActions activeTab={activeTab} emberAction={emberAction} lowConfidenceFields={lowConfidenceFields} onFill={handleEmberAction} />}
          {!isReadOnly && hasEarlySignal && activeTab === "Discover" && <MarketNudge onClick={() => setQuickAction("Based on what I've entered, analyze the market opportunity")} />}
          {!isReadOnly && <AutofillBox value={autofillIdea} loading={isAutofilling} onChange={setAutofillIdea} onSubmit={handleAutofill} />}
          {activeTabContent}
        </section>
        <section className={cn("p-4 md:p-5 lg:hidden", mobilePanel !== "docs" && "hidden")}>
          <DocUpload opportunityId={opportunity.id} disabled={isReadOnly} onSynthesized={() => refetch()} onFieldUpdates={applyEmberPatch} />
        </section>
      </main>
      {isEmberOpen && (
        <div className="fixed inset-0 z-40">
          <button type="button" aria-label="Close Ember overlay" className="absolute inset-0 bg-black/30" onClick={() => setIsEmberOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-os-border bg-os-bg shadow-os-lg">
            <EmberPanel opportunityId={opportunity.id} initialMessages={data.messages} activeAgent={tabAgent[activeTab]} activeTab={activeTab} quickAction={quickAction} onQuickActionHandled={() => setQuickAction(null)} readOnly={isReadOnly} onFieldUpdates={applyEmberPatch} onCollapse={() => setIsEmberOpen(false)} onRefresh={async () => { await refetch(); }} />
          </aside>
        </div>
      )}
      <NotesDrawer open={isNotesOpen} opportunity={opportunity} notes={notes} documents={data.documents} pendingDocumentAction={pendingDocumentAction} isReadOnly={isReadOnly} onClose={() => setIsNotesOpen(false)} onNotesChange={onNotesChange} onAgentAction={(message) => { setQuickAction(message); setIsNotesOpen(false); setIsEmberOpen(true); }} onFillNotes={() => handleEmberAction("Notes", "Fill the notes drawer with thesis, customer notes, open questions, kill conditions, moat insight, and decision log")} onFieldUpdates={applyEmberPatch} onPendingDocumentActionChange={setPendingDocumentAction} onDocumentsChanged={async () => { await refetch(); }} onDocumentResponse={async (message) => { await refetch(); if (message && !message.startsWith("Uploaded document:")) { setIsNotesOpen(false); setIsEmberOpen(true); } }} />
    </div>
  );
}

function LoadingWhiteboard() {
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

function Header({ opportunityName, isReadOnly, saveStatus, score, copyPending, upload, onNameChange, onCopy, onOpenEmber, onOpenNotes }: { opportunityName: string; isReadOnly: boolean; saveStatus: "saved" | "saving" | "error"; score: number; copyPending: boolean; upload: ReactNode; onNameChange: (name: string) => void; onCopy: () => void; onOpenEmber: () => void; onOpenNotes: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-os-border bg-os-bg/90 px-4 py-3 backdrop-blur md:px-5 md:py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-os-md px-2 text-os-sm text-os-sub hover:bg-os-panel hover:text-os-text"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Dashboard</Link>
          <input aria-label="Opportunity name" value={opportunityName} onChange={(event) => onNameChange(event.target.value)} disabled={isReadOnly} className="h-11 min-w-0 rounded-os-md border border-os-border bg-os-surface px-3 font-display text-base font-semibold text-os-text focus:border-os-indigo disabled:opacity-80 md:h-9 md:text-lg" />
        </div>
        <div className="flex items-center gap-3">
          {isReadOnly && <Badge tone="indigo">Shared demo</Badge>}
          <Badge tone={isReadOnly ? "indigo" : saveStatus === "error" ? "red" : saveStatus === "saving" ? "amber" : "green"} className="gap-2">{saveStatus === "saving" ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : <Check className="h-3 w-3" aria-hidden="true" />}{isReadOnly ? "Read-only" : saveStatus === "saving" ? "Saving..." : saveStatus === "error" ? "Save failed" : "Saved"}</Badge>
          {isReadOnly && <Button type="button" variant="primary" size="sm" loading={copyPending} onClick={onCopy}>Copy to my workspace</Button>}
          {upload}
          <Button type="button" variant="secondary" size="sm" onClick={onOpenNotes} leftIcon={<StickyNote className="h-4 w-4" aria-hidden="true" />}>Notes</Button>
          <Button type="button" variant="primary" size="sm" onClick={onOpenEmber} leftIcon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}>Ask Ember</Button>
          <OpportunityScore score={score} />
        </div>
      </div>
    </header>
  );
}

function MobileSwitcher({ value, onChange }: { value: MobilePanel; onChange: (value: MobilePanel) => void }) {
  return <div className="grid grid-cols-2 gap-2 border-b border-os-border bg-os-surface p-2 lg:hidden">{[["whiteboard", "Whiteboard", MessageCircle], ["docs", "Docs", Upload]].map(([next, label, Icon]) => <Button key={next as string} type="button" variant={value === next ? "primary" : "secondary"} size="md" onClick={() => onChange(next as MobilePanel)} leftIcon={<Icon className="h-4 w-4" aria-hidden="true" />}>{label as string}</Button>)}</div>;
}

function ReadOnlyNotice({ loading, onCopy }: { loading: boolean; onCopy: () => void }) {
  return <div className="mb-5 rounded-os-md border border-os-indigo/40 bg-os-indigo/10 p-4"><p className="text-os-sm text-os-text">This shared demo is read-only for everyone. Copy it to your workspace to edit fields, upload documents, create tasks, or chat with Ember.</p><Button type="button" variant="primary" size="md" className="mt-3" loading={loading} onClick={onCopy}>Copy to my workspace</Button></div>;
}

function EmberActions({ activeTab, emberAction, lowConfidenceFields, onFill }: { activeTab: Tab; emberAction: string | null; lowConfidenceFields: string[]; onFill: (section: string, intent?: string) => void }) {
  return <div className="mb-5 rounded-os-md border border-os-border bg-os-surface p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-display text-sm font-semibold text-os-text">Ember cofounder actions</p><p className="mt-1 text-os-sm text-os-sub">Use structured actions to make Ember update the whiteboard directly. Chat is available for explanation, but these actions write to the UI.</p></div>{lowConfidenceFields.length > 0 && <Badge tone="amber">Review {lowConfidenceFields.length} low-confidence estimates</Badge>}</div><div className="mt-3 grid gap-2 md:grid-cols-4"><Button type="button" variant="primary" size="sm" loading={emberAction === `${activeTab}:Fill missing fields`} onClick={() => onFill(activeTab, "Fill missing fields")}>Fill missing fields</Button><Button type="button" variant="secondary" size="sm" loading={emberAction === `${activeTab}:Improve this section`} onClick={() => onFill(activeTab, "Improve this section with sharper cofounder-quality assumptions")}>Improve this tab</Button><Button type="button" variant="secondary" size="sm" loading={emberAction === "Risks:Stress-test the opportunity and generate the most important risks"} onClick={() => onFill("Risks", "Stress-test the opportunity and generate the most important risks")}>Stress-test</Button><Button type="button" variant="secondary" size="sm" loading={emberAction === "Build:Generate the next 90 days with milestones and tasks"} onClick={() => onFill("Build", "Generate the next 90 days with milestones and tasks")}>Next 90 days</Button></div>{lowConfidenceFields.length > 0 && <p className="mt-3 text-os-xs text-os-sub">Low-confidence estimates: {lowConfidenceFields.join(", ")}. Editing a field clears its Ember estimate marker.</p>}</div>;
}

function MarketNudge({ onClick }: { onClick: () => void }) {
  return <div className="mb-5 rounded-os-md border border-os-indigo/40 bg-os-indigo/10 p-4"><p className="text-os-sm text-os-text">You have enough signal for Ember to pressure-test the market angle.</p><Button type="button" variant="primary" size="md" className="mt-3" onClick={onClick}>Ask Ember about the market opportunity</Button></div>;
}

function AutofillBox({ value, loading, onChange, onSubmit }: { value: string; loading: boolean; onChange: (value: string) => void; onSubmit: () => void }) {
  return <div className="mb-5 rounded-os-md border border-os-border bg-os-surface p-4"><p className="font-display text-sm font-semibold text-os-text">Give Ember more context</p><p className="mt-1 text-os-sm text-os-sub">Add a short update and Ember will repopulate the full opportunity as a cofounder-quality working draft.</p><div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]"><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Example: AI copilot that helps finance teams approve SaaS purchases in Slack..." className="rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo" /><Button type="button" variant="primary" size="md" loading={loading} disabled={!value.trim() || loading} onClick={onSubmit}>Let Ember fill this</Button></div></div>;
}
