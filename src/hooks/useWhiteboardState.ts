"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import { useOpportunity, useUpdateOpportunity } from "@/hooks/useOpportunity";
import { normalizeEmberFieldPatch, type EmberConfidence } from "@/lib/ember/fieldUpdates";
import { calculateOpportunityScore } from "@/lib/score";
import type { Milestone, Opportunity, OpportunityNotes, RiskAssessment } from "@/types";

export type MobilePanel = "whiteboard" | "docs";

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

export function useWhiteboardState(opportunityId: string) {
  const { data, isLoading, error, refetch } = useOpportunity(opportunityId);
  const { mutateAsync: saveOpportunity } = useUpdateOpportunity(opportunityId);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [notes, setNotes] = useState<OpportunityNotes | null>(null);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("whiteboard");
  const [generatedConfidence, setGeneratedConfidence] = useState<Record<string, EmberConfidence>>({});
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

  function markDirty() {
    changeVersion.current += 1;
    setDirtyVersion(changeVersion.current);
  }

  function clearConfidence(paths: string[]) {
    setGeneratedConfidence((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => !paths.some((path) => key === path || key.startsWith(`${path}.`))))
    );
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

  const isReadOnly = Boolean(opportunity?.is_demo);

  function applyEmberPatch(payload: unknown) {
    if (!opportunity) return;
    const patch = normalizeEmberFieldPatch(payload);
    let updated = 0;
    if (Object.keys(patch.confidence).length > 0) {
      setGeneratedConfidence((current) => ({ ...current, ...patch.confidence }));
    }

    if (Object.keys(patch.opportunity).length > 0) {
      markDirty();
      setOpportunity((current) => (current ? { ...current, ...patch.opportunity } : current));
      updated += Object.keys(patch.opportunity).length;
    }

    if (Object.keys(patch.notes).length > 0) {
      markDirty();
      setNotes((current) => (current ? { ...current, ...patch.notes } : current));
      updated += Object.keys(patch.notes).length;
    }

    if (patch.risks) {
      markDirty();
      setRisks(
        patch.risks.map((risk) => ({
          id: risk.id ?? crypto.randomUUID(),
          opportunity_id: opportunity.id,
          user_id: opportunity.user_id,
          risk_label: risk.risk_label ?? "Untitled risk",
          heat_level: risk.heat_level ?? "medium",
          category: risk.category ?? "market",
          likelihood: risk.likelihood ?? "high",
          impact: risk.impact ?? "high",
          mitigation_note: risk.mitigation_note ?? "",
          owner: risk.owner ?? "Founder",
          status: risk.status ?? "open",
          created_at: risk.created_at ?? new Date().toISOString()
        }))
      );
      updated += patch.risks.length;
    }

    if (patch.milestones) {
      markDirty();
      setMilestones(
        patch.milestones.map((milestone) => ({
          id: milestone.id ?? crypto.randomUUID(),
          opportunity_id: opportunity.id,
          user_id: opportunity.user_id,
          title: milestone.title ?? "Untitled milestone",
          target_date: milestone.target_date ?? null,
          done: Boolean(milestone.done),
          created_at: milestone.created_at ?? new Date().toISOString()
        }))
      );
      updated += patch.milestones.length;
    }

    if (patch.tasks) updated += patch.tasks.length;
    if (updated > 0) toast.success(`Ember updated ${updated} fields — review and adjust.`);
  }

  function onOpportunityChange(patch: Partial<Opportunity>) {
    if (isReadOnly) return;
    markDirty();
    clearConfidence(Object.keys(patch).map((key) => `opportunity.${key}`));
    setOpportunity((current) => (current ? { ...current, ...patch } : current));
  }

  function onNotesChange(patch: Partial<OpportunityNotes>) {
    if (isReadOnly) return;
    markDirty();
    clearConfidence(Object.keys(patch).map((key) => `notes.${key}`));
    setNotes((current) => (current ? { ...current, ...patch } : current));
  }

  function onRisksChange(nextRisks: RiskAssessment[]) {
    if (isReadOnly) return;
    markDirty();
    clearConfidence(["risks"]);
    setRisks(nextRisks);
  }

  function onMilestonesChange(nextMilestones: Milestone[]) {
    if (isReadOnly) return;
    markDirty();
    clearConfidence(["milestones"]);
    setMilestones(nextMilestones);
  }

  const lowConfidenceFields = Object.entries(generatedConfidence)
    .filter(([, confidence]) => confidence === "low")
    .map(([field]) => field)
    .slice(0, 6);

  const hasEarlySignal =
    opportunity
      ? [opportunity.urgency, opportunity.pain, opportunity.frequency, opportunity.willingness_to_pay].filter((value) => value >= 7).length >= 2 ||
        opportunity.timing_signals.length > 0
      : false;

  return {
    data,
    isLoading,
    error,
    refetch,
    opportunity,
    notes,
    risks,
    milestones,
    mobilePanel,
    setMobilePanel,
    saveStatus,
    score,
    isReadOnly,
    lowConfidenceFields,
    hasEarlySignal,
    applyEmberPatch,
    onOpportunityChange,
    onNotesChange,
    onRisksChange,
    onMilestonesChange
  };
}
