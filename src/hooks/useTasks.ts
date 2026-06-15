import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Priority, Task, TaskCategory } from "@/types";

type TasksCache = { tasks: Task[] };

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
    mutationFn: async (task: { text: string; category: TaskCategory; phase?: string; priority?: Priority; due_date?: string | null }) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, opportunityId })
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", opportunityId] });
      const previous = queryClient.getQueryData<TasksCache>(["tasks", opportunityId]);
      const optimisticTask: Task = {
        id: `optimistic-${Date.now()}`,
        opportunity_id: opportunityId,
        user_id: "",
        text: task.text,
        category: task.category,
        phase: (task.phase as Task["phase"]) || "0→1",
        done: false,
        priority: task.priority ?? "medium",
        due_date: task.due_date ?? null,
        created_at: new Date().toISOString()
      };
      queryClient.setQueryData<TasksCache>(["tasks", opportunityId], { tasks: [...(previous?.tasks ?? []), optimisticTask] });
      return { previous };
    },
    onError: (_error, _task, context) => {
      if (context?.previous) queryClient.setQueryData(["tasks", opportunityId], context.previous);
    },
    onSettled: () => {
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
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", opportunityId] });
      const previous = queryClient.getQueryData<TasksCache>(["tasks", opportunityId]);
      queryClient.setQueryData<TasksCache>(["tasks", opportunityId], {
        tasks: (previous?.tasks ?? []).map((task) => (task.id === id ? { ...task, ...patch } : task))
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["tasks", opportunityId], context.previous);
    },
    onSettled: () => {
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", opportunityId] });
      const previous = queryClient.getQueryData<TasksCache>(["tasks", opportunityId]);
      queryClient.setQueryData<TasksCache>(["tasks", opportunityId], {
        tasks: (previous?.tasks ?? []).filter((task) => task.id !== id)
      });
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(["tasks", opportunityId], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", opportunityId] });
      queryClient.invalidateQueries({ queryKey: ["opportunity", opportunityId] });
    }
  });
}
