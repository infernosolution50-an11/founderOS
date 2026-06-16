"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";

type UseAutofillArgs = {
  opportunityId: string;
  opportunityName: string;
  isReadOnly?: boolean;
  onFieldsUpdated: (payload: unknown) => void;
  onTasksChanged?: () => void | Promise<void>;
};

export function useAutofill({ opportunityId, opportunityName, isReadOnly, onFieldsUpdated, onTasksChanged }: UseAutofillArgs) {
  const queryClient = useQueryClient();
  const [autofillIdea, setAutofillIdea] = useState("");
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [emberAction, setEmberAction] = useState<string | null>(null);

  async function handleEmberAction(section: string, intent = "Fill missing fields with a conservative cofounder-quality first pass.") {
    if (isReadOnly) return;
    setEmberAction(`${section}:${intent}`);
    try {
      const response = await fetch("/api/ember/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, action: "fill_section", section, intent })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Could not fill this section.");
      onFieldsUpdated(payload.fill);
      if ((payload.fill?.tasks?.length ?? 0) > 0 || (payload.tasks?.length ?? 0) > 0) {
        await queryClient.invalidateQueries({ queryKey: ["tasks", opportunityId] });
        await onTasksChanged?.();
      }
    } catch (fillError) {
      toast.error(fillError instanceof Error ? fillError.message : "Could not fill this section.");
    } finally {
      setEmberAction(null);
    }
  }

  async function handleAutofill() {
    if (!autofillIdea.trim() || isReadOnly) return;
    setIsAutofilling(true);
    try {
      const response = await fetch("/api/ember/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityName, idea: autofillIdea })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Could not autofill this opportunity.");
      onFieldsUpdated(payload.autofill);
      setAutofillIdea("");
    } catch (autofillError) {
      toast.error(autofillError instanceof Error ? autofillError.message : "Could not autofill this opportunity.");
    } finally {
      setIsAutofilling(false);
    }
  }

  return {
    autofillIdea,
    setAutofillIdea,
    isAutofilling,
    emberAction,
    handleAutofill,
    handleEmberAction
  };
}
