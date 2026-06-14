import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskCategory } from "@/types";

export function useTasks(opportunityId: string) {
  return useQuery({
    queryKey: ["tasks", opportunityId],
    enabled: Boolean(opportunityId),
    queryFn: async (): Promise<{ tasks: Task[] }> => {
      const response = await fetch(`/api/tasks?opportunityId=${opportunityId}`);
      if (!response.ok) throw new Error("Failed to load tasks");
      return response.json();
    }
  });
}

export function useCreateTask(opportunityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: { text: string; category: TaskCategory; phase?: string }) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, opportunityId })
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", opportunityId] });
      queryClient.invalidateQueries({ queryKey: ["opportunity", opportunityId] });
    }
  });
}

export function useUpdateTask(opportunityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Task> }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", opportunityId] });
      queryClient.invalidateQueries({ queryKey: ["opportunity", opportunityId] });
    }
  });
}

export function useDeleteTask(opportunityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", opportunityId] });
      queryClient.invalidateQueries({ queryKey: ["opportunity", opportunityId] });
    }
  });
}
