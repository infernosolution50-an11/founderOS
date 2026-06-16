"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { normalizeEmberFieldPatch } from "@/lib/ember/fieldUpdates";
import { cn } from "@/lib/utils";
import type { AgentType, Opportunity } from "@/types";

type EmberFieldButtonProps = {
  opportunityId: string;
  fieldKey: keyof Opportunity;
  agentType: AgentType;
  onUpdate: (patch: Partial<Opportunity>) => void;
  disabled?: boolean;
};

function fieldLabel(fieldKey: keyof Opportunity) {
  return String(fieldKey).replace(/_/g, " ");
}

export function EmberFieldButton({ opportunityId, fieldKey, agentType, onUpdate, disabled }: EmberFieldButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function improveField() {
    if (disabled || isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/ember/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          action: "fill_field",
          fieldKey,
          agentType,
          fillBlanksOnly: false
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Ember could not update this field.");

      const normalized = normalizeEmberFieldPatch(payload.fill ?? payload);
      const value = normalized.opportunity[fieldKey];
      if (value === undefined) throw new Error("Ember did not return a usable field update.");
      onUpdate({ [fieldKey]: value } as Partial<Opportunity>);
      toast.success(`Ember updated ${fieldLabel(fieldKey)}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ember could not update this field.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={`Improve ${fieldLabel(fieldKey)} with Ember`}
      disabled={disabled || isLoading}
      onClick={improveField}
      className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full border border-os-border text-os-sub hover:border-os-indigo hover:text-os-indigo disabled:cursor-not-allowed disabled:opacity-40")}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
