import { useState } from "react";
import { ListChecks } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { TaskItem } from "@/components/ui/TaskItem";
import { useCreateTask, useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import type { Phase, TaskCategory } from "@/types";
import type { WhiteboardTabProps } from "./types";

const phases: Phase[] = ["0→1", "1→10", "10→100"];
const categories: TaskCategory[] = ["research", "product", "sales", "ops"];

export function ExecuteTab({ opportunity, tasks, onOpportunityChange, onAgentAction }: WhiteboardTabProps) {
  const [phase, setPhase] = useState<Phase>(opportunity.phase);
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "all">("all");
  const [text, setText] = useState("");
  const [category, setCategory] = useState<TaskCategory>("research");
  const createTask = useCreateTask(opportunity.id);
  const updateTask = useUpdateTask(opportunity.id);
  const deleteTask = useDeleteTask(opportunity.id);

  const filteredTasks = tasks.filter((task) => task.phase === phase && (categoryFilter === "all" || task.category === categoryFilter));

  async function addTask() {
    if (!text.trim()) return;
    await createTask.mutateAsync({ text, category, phase });
    setText("");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {phases.map((phaseOption) => (
          <button
            key={phaseOption}
            type="button"
            onClick={() => {
              setPhase(phaseOption);
              onOpportunityChange({ phase: phaseOption });
            }}
            className={phase === phaseOption ? "rounded-full bg-os-indigo px-4 py-2 text-white" : "rounded-full border border-os-border px-4 py-2 text-os-sub"}
          >
            {phaseOption} {phaseOption === "0→1" ? "Validate" : phaseOption === "1→10" ? "Build" : "Scale"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["kpi_primary", "Primary KPI"],
          ["kpi_revenue", "Revenue goal"],
          ["kpi_learning", "Learning goal"]
        ].map(([key, label]) => (
          <label key={key} className="rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
            {label}
            <input
              value={String(opportunity[key as keyof typeof opportunity] ?? "")}
              onChange={(event) => onOpportunityChange({ [key]: event.target.value })}
              className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo"
            />
          </label>
        ))}
      </div>

      <div className="rounded-2xl border border-os-border bg-os-surface p-4">
        <div className="font-display text-sm font-semibold text-os-text">Conviction</div>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onOpportunityChange({ conviction_stars: star })}
              className={star <= opportunity.conviction_stars ? "text-2xl text-os-amber" : "text-2xl text-os-muted"}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-2xl border border-os-border bg-os-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Task board</h2>
          <div className="flex flex-wrap gap-2">
            {(["all", ...categories] as const).map((option) => (
              <button key={option} type="button" onClick={() => setCategoryFilter(option)} className="rounded-full border border-os-border px-3 py-1 text-xs capitalize text-os-sub">
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={(done) => updateTask.mutate({ id: task.id, patch: { done } })}
              onDelete={() => deleteTask.mutate(task.id)}
            />
          ))}
          {filteredTasks.length === 0 && (
            <EmptyState
              icon={<ListChecks className="h-5 w-5" aria-hidden="true" />}
              title="No tasks yet."
              description="Ask Ember to generate your first action plan, then turn the best moves into concrete tasks."
              action={
                <Button type="button" variant="primary" size="lg" onClick={() => onAgentAction("Generate action plan")}>
                  Ask Ember
                </Button>
              }
            />
          )}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Add task" className="rounded-xl border border-os-border bg-os-surface px-3 py-2 text-os-text focus:border-os-indigo" />
          <select value={category} onChange={(event) => setCategory(event.target.value as TaskCategory)} className="rounded-xl border border-os-border bg-os-surface px-3 py-2 text-os-text">
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button type="button" onClick={addTask} className="rounded-xl bg-os-indigo px-4 py-2 font-semibold text-white">
            Add
          </button>
        </div>
      </section>

      <button type="button" onClick={() => onAgentAction("Generate action plan")} className="rounded-xl bg-os-indigo px-4 py-3 font-semibold text-white">
        Generate action plan
      </button>
    </div>
  );
}
