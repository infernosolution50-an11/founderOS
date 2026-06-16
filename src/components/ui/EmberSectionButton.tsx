"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/toast";
import { normalizeEmberFieldPatch } from "@/lib/ember/fieldUpdates";
import type { AgentType, Opportunity } from "@/types";

type EmberSectionButtonProps = {
  opportunityId: string;
  label: string;
  allowedFields: (keyof Opportunity)[];
  agentType: AgentType;
  onUpdate: (patch: Partial<Opportunity>) => void;
  fillBlanksOnly?: boolean;
  disabled?: boolean;
};

export function EmberSectionButton({ opportunityId, label, allowedFields, agentType, onUpdate, fillBlanksOnly = true, disabled }: EmberSectionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function fillSection() {
    if (disabled || isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/ember/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          action: "fill_fields",
          allowedFields,
          agentType,
          fillBlanksOnly
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Ember could not fill this section.");

      const normalized = normalizeEmberFieldPatch(payload.fill ?? payload);
      const patch = Object.fromEntries(
        Object.entries(normalized.opportunity).filter(([key]) => allowedFields.includes(key as keyof Opportunity))
      ) as Partial<Opportunity>;
      const count = Object.keys(patch).length;
      if (count > 0) onUpdate(patch);
      toast.success(count > 0 ? `Ember updated ${count} field${count === 1 ? "" : "s"}.` : "Ember found no blank fields to update.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ember could not fill this section.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" loading={isLoading} disabled={disabled || isLoading} onClick={fillSection} leftIcon={<Sparkles className="h-4 w-4" aria-hidden="true" />}>
      {label}
    </Button>
  );
}
