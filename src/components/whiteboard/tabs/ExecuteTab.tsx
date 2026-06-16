import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ListChecks } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/toast";
import { TaskItem } from "@/components/ui/TaskItem";
import { useCreateTask, useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { FieldLabel } from "@/components/ui/Tooltip";
import { fieldTooltips } from "@/lib/fieldTooltips";
import type { Milestone, Phase, Priority, TaskCategory } from "@/types";
import type { WhiteboardTabProps } from "./types";

const phases: Phase[] = ["0→1", "1→10", "10→100"];
const categories: TaskCategory[] = ["research", "product", "sales", "ops", "hiring"];

export function ExecuteTab({ opportunity, tasks, milestones, isReadOnly, onOpportunityChange, onMilestonesChange, onAgentAction, onFillSection }: WhiteboardTabProps) {
  const [phase, setPhase] = useState<Phase>(opportunity.phase);
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "all">("all");
  const [text, setText] = useState("");
  const [category, setCategory] = useState<TaskCategory>("research");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDate, setMilestoneDate] = useState("");
  const createTask = useCreateTask(opportunity.id);
  const updateTask = useUpdateTask(opportunity.id);
  const deleteTask = useDeleteTask(opportunity.id);
  const queryClient = useQueryClient();

  const filteredTasks = tasks.filter((task) => task.phase === phase && (categoryFilter === "all" || task.category === categoryFilter));

  async function addTask() {
    if (isReadOnly || !text.trim()) return;
    await createTask.mutateAsync({ text, category, phase, priority, due_date: dueDate || null });
    await queryClient.invalidateQueries({ queryKey: ["tasks", opportunity.id] });
    await queryClient.invalidateQueries({ queryKey: ["opportunity", opportunity.id] });
    setText("");
    setDueDate("");
  }

  function confirmDeleteTask(id: string, taskText: string) {
    if (isReadOnly) return;
    if (!window.confirm(`Delete task "${taskText}"?`)) return;
    deleteTask.mutate(id);
  }

  async function createActionPlanTasks() {
    if (isReadOnly) return;
    if (!window.confirm("Create a starter action plan as tasks from Ember?")) return;

    const response = await fetch("/api/ember/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: opportunity.id, action: "create_action_plan" })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? "Could not create action plan tasks.");
      return;
    }

    toast.success("Action plan tasks created.");
    await queryClient.invalidateQueries({ queryKey: ["tasks", opportunity.id] });
    await queryClient.invalidateQueries({ queryKey: ["opportunity", opportunity.id] });
  }

  function updateMilestone(index: number, patch: Partial<Milestone>) {
    onMilestonesChange(milestones.map((milestone, milestoneIndex) => (milestoneIndex === index ? { ...milestone, ...patch } : milestone)));
  }

  function addMilestone() {
    if (isReadOnly || !milestoneTitle.trim()) return;
    onMilestonesChange([
      ...milestones,
      {
        id: crypto.randomUUID(),
        opportunity_id: opportunity.id,
        user_id: opportunity.user_id,
        title: milestoneTitle,
        target_date: milestoneDate || null,
        done: false,
        created_at: new Date().toISOString()
      }
    ]);
    setMilestoneTitle("");
    setMilestoneDate("");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Build</h2>
        <Button type="button" variant="secondary" size="sm" disabled={isReadOnly} onClick={() => onFillSection?.("Build")}>
          Ask Ember to fill this section
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {phases.map((phaseOption) => (
          <button
            key={phaseOption}
            type="button"
            onClick={() => {
              setPhase(phaseOption);
              onOpportunityChange({ phase: phaseOption });
            }}
            disabled={isReadOnly}
            className={phase === phaseOption ? "rounded-full bg-os-indigo px-4 py-2 text-white" : "rounded-full border border-os-border px-4 py-2 text-os-sub"}
          >
            <FieldLabel label={`${phaseOption} ${phaseOption === "0→1" ? "Validate" : phaseOption === "1→10" ? "Build" : "Scale"}`} tooltip={fieldTooltips.phase} />
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["kpi_primary", "North star metric"],
          ["kpi_revenue", "Revenue metric"],
          ["kpi_learning", "Learning metric"],
          ["sprint_goal_90_day", "90-day goal"],
          ["next_fundraise_trigger", "What triggers your next raise?"]
        ].map(([key, label]) => (
          <label key={key} className="rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
            <FieldLabel label={label} tooltip={fieldTooltips[key as keyof typeof fieldTooltips]} />
            <input
              value={String(opportunity[key as keyof typeof opportunity] ?? "")}
              onChange={(event) => onOpportunityChange({ [key]: event.target.value })}
              disabled={isReadOnly}
              className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo"
            />
          </label>
        ))}
        <label className="rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
          <FieldLabel label="Runway estimate in months" tooltip={fieldTooltips.runway_months} />
          <input
            type="number"
            value={opportunity.runway_months}
            onChange={(event) => onOpportunityChange({ runway_months: Number(event.target.value) })}
            disabled={isReadOnly}
            className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
          />
        </label>
      </div>

      <section className="rounded-2xl border border-os-border bg-os-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Task board</h2>
          <div className="flex flex-wrap gap-2">
            {(["all", ...categories] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCategoryFilter(option)}
                className={
                  categoryFilter === option
                    ? "rounded-full border border-os-indigo bg-os-indigo/15 px-3 py-1 text-xs capitalize text-os-indigo"
                    : "rounded-full border border-os-border px-3 py-1 text-xs capitalize text-os-sub"
                }
              >
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
              onDelete={() => confirmDeleteTask(task.id, task.text)}
            />
          ))}
          {filteredTasks.length === 0 && (
            <EmptyState
              icon={<ListChecks className="h-5 w-5" aria-hidden="true" />}
              title="No tasks yet."
              description="Ask Ember to generate your first action plan, then turn the best moves into concrete tasks."
              action={
                <Button type="button" variant="primary" size="lg" disabled={isReadOnly} onClick={() => onAgentAction("Generate action plan")}>
                  Ask Ember
                </Button>
              }
            />
          )}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
          <input disabled={isReadOnly} value={text} onChange={(event) => setText(event.target.value)} placeholder={isReadOnly ? "Copy demo before adding tasks" : "Add task"} className="rounded-xl border border-os-border bg-os-surface px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50" />
          <select disabled={isReadOnly} value={category} onChange={(event) => setCategory(event.target.value as TaskCategory)} className="rounded-xl border border-os-border bg-os-surface px-3 py-2 text-os-text disabled:opacity-50">
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select disabled={isReadOnly} value={priority} onChange={(event) => setPriority(event.target.value as Priority)} className="rounded-xl border border-os-border bg-os-surface px-3 py-2 text-os-text disabled:opacity-50">
            {(["low", "medium", "high"] as const).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input disabled={isReadOnly} type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="rounded-xl border border-os-border bg-os-surface px-3 py-2 text-os-text disabled:opacity-50" />
          <button type="button" disabled={isReadOnly} onClick={addTask} className="rounded-xl bg-os-indigo px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
            Add
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-os-border bg-os-panel p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">
            <FieldLabel label="Milestone tracker" tooltip={fieldTooltips.milestones} />
          </h2>
        </div>
        <div className="mt-4 grid gap-3">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="grid gap-3 rounded-xl border border-os-border bg-os-surface p-3 md:grid-cols-[auto_1fr_auto_auto]">
              <input type="checkbox" checked={milestone.done} disabled={isReadOnly} onChange={(event) => updateMilestone(index, { done: event.target.checked })} />
              <input value={milestone.title} disabled={isReadOnly} onChange={(event) => updateMilestone(index, { title: event.target.value })} className="rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text disabled:opacity-50" />
              <input type="date" value={milestone.target_date ?? ""} disabled={isReadOnly} onChange={(event) => updateMilestone(index, { target_date: event.target.value || null })} className="rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text disabled:opacity-50" />
              <button type="button" disabled={isReadOnly} onClick={() => onMilestonesChange(milestones.filter((_, milestoneIndex) => milestoneIndex !== index))} className="rounded-xl border border-os-border px-3 py-2 text-sm text-os-muted hover:text-os-red disabled:opacity-50">
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input value={milestoneTitle} disabled={isReadOnly} onChange={(event) => setMilestoneTitle(event.target.value)} placeholder="Add milestone" className="rounded-xl border border-os-border bg-os-surface px-3 py-2 text-os-text disabled:opacity-50" />
          <input type="date" value={milestoneDate} disabled={isReadOnly} onChange={(event) => setMilestoneDate(event.target.value)} className="rounded-xl border border-os-border bg-os-surface px-3 py-2 text-os-text disabled:opacity-50" />
          <button type="button" disabled={isReadOnly} onClick={addMilestone} className="rounded-xl bg-os-indigo px-4 py-2 font-semibold text-white disabled:opacity-40">
            Add milestone
          </button>
        </div>
      </section>

      <button type="button" disabled={isReadOnly} onClick={() => onAgentAction("Generate action plan")} className="rounded-xl bg-os-indigo px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
        Generate action plan
      </button>
      <button type="button" disabled={isReadOnly} onClick={createActionPlanTasks} className="ml-3 rounded-xl border border-os-border px-4 py-3 font-semibold text-os-text disabled:cursor-not-allowed disabled:opacity-40">
        Create tasks from Ember
      </button>
    </div>
  );
}
