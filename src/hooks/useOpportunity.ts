import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DocumentRecord, EmberMessage, Opportunity, OpportunityNotes, RiskAssessment, Task } from "@/types";

export type OpportunityBundle = {
  opportunity: Opportunity;
  notes: OpportunityNotes | null;
  risks: RiskAssessment[];
  tasks: Task[];
  documents: DocumentRecord[];
  messages: EmberMessage[];
};

async function fetchOpportunity(id: string): Promise<OpportunityBundle> {
  const response = await fetch(`/api/opportunities/${id}`);
  if (!response.ok) throw new Error("Failed to load opportunity");
  return response.json();
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => fetchOpportunity(id),
    enabled: Boolean(id)
  });
}

export function useUpdateOpportunity(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
      if (!response.ok) throw new Error("Failed to save opportunity");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunity", id] });
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    }
  });
}

export function useOpportunities() {
  return useQuery({
    queryKey: ["opportunities"],
    queryFn: async (): Promise<{ opportunities: Opportunity[] }> => {
      const response = await fetch("/api/opportunities");
      if (!response.ok) throw new Error("Failed to load opportunities");
      return response.json();
    }
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload?: { example?: boolean; sourceDemoId?: string }) => {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ?? {})
      });
      if (!response.ok) throw new Error("Failed to create opportunity");
      return response.json() as Promise<{ opportunity: Opportunity }>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["opportunities"] })
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete opportunity");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["opportunities"] })
  });
}
