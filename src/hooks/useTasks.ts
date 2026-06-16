import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Priority, Task, TaskCategory } from "@/types";

type TasksCache = { tasks: Task[] };
type OpportunityTasksCache = { tasks: Task[] };

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
      const previousOpportunity = queryClient.getQueryData<OpportunityTasksCache>(["opportunity", opportunityId]);
      return { previous, previousOpportunity };
    },
    onSuccess: (result: { task?: Task }) => {
      if (!result.task) return;
      const upsertTask = (tasks: Task[]) => {
        const exists = tasks.some((task) => task.id === result.task!.id);
        return exists ? tasks.map((task) => (task.id === result.task!.id ? result.task! : task)) : [...tasks, result.task!];
      };
      const current = queryClient.getQueryData<TasksCache>(["tasks", opportunityId]);
      if (current) queryClient.setQueryData<TasksCache>(["tasks", opportunityId], { tasks: upsertTask(current.tasks) });
      const currentOpportunity = queryClient.getQueryData<OpportunityTasksCache>(["opportunity", opportunityId]);
      if (currentOpportunity) {
        queryClient.setQueryData<OpportunityTasksCache>(["opportunity", opportunityId], {
          ...currentOpportunity,
          tasks: upsertTask(currentOpportunity.tasks ?? [])
        });
      }
    },
    onError: (_error, _task, context) => {
      if (context?.previous) queryClient.setQueryData(["tasks", opportunityId], context.previous);
      if (context?.previousOpportunity) queryClient.setQueryData(["opportunity", opportunityId], context.previousOpportunity);
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
      const previousOpportunity = queryClient.getQueryData<OpportunityTasksCache>(["opportunity", opportunityId]);
      queryClient.setQueryData<TasksCache>(["tasks", opportunityId], {
        tasks: (previous?.tasks ?? []).map((task) => (task.id === id ? { ...task, ...patch } : task))
      });
      if (previousOpportunity) {
        queryClient.setQueryData<OpportunityTasksCache>(["opportunity", opportunityId], {
          ...previousOpportunity,
          tasks: (previousOpportunity.tasks ?? []).map((task) => (task.id === id ? { ...task, ...patch } : task))
        });
      }
      return { previous, previousOpportunity };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["tasks", opportunityId], context.previous);
      if (context?.previousOpportunity) queryClient.setQueryData(["opportunity", opportunityId], context.previousOpportunity);
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
      const previousOpportunity = queryClient.getQueryData<OpportunityTasksCache>(["opportunity", opportunityId]);
      queryClient.setQueryData<TasksCache>(["tasks", opportunityId], {
        tasks: (previous?.tasks ?? []).filter((task) => task.id !== id)
      });
      if (previousOpportunity) {
        queryClient.setQueryData<OpportunityTasksCache>(["opportunity", opportunityId], {
          ...previousOpportunity,
          tasks: (previousOpportunity.tasks ?? []).filter((task) => task.id !== id)
        });
      }
      return { previous, previousOpportunity };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(["tasks", opportunityId], context.previous);
      if (context?.previousOpportunity) queryClient.setQueryData(["opportunity", opportunityId], context.previousOpportunity);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", opportunityId] });
      queryClient.invalidateQueries({ queryKey: ["opportunity", opportunityId] });
    }
  });
}
