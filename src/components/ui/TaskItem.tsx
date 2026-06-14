import type { Task } from "@/types";

type TaskItemProps = {
  task: Task;
  onToggle: (done: boolean) => void;
  onDelete: () => void;
};

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-os-border bg-os-surface p-3">
      <input
        type="checkbox"
        checked={task.done}
        onChange={(event) => onToggle(event.target.checked)}
        className="mt-1 h-4 w-4 accent-os-indigo"
      />
      <div className="min-w-0 flex-1">
        <p className={task.done ? "text-sm text-os-muted line-through" : "text-sm text-os-text"}>{task.text}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-os-sub">
          <span className="rounded-full bg-os-panel px-2 py-1 capitalize">{task.category}</span>
          <span className="rounded-full bg-os-panel px-2 py-1">{task.phase}</span>
          <span className="rounded-full bg-os-panel px-2 py-1 capitalize">{task.priority}</span>
        </div>
      </div>
      <button type="button" onClick={onDelete} className="text-xs text-os-muted hover:text-os-red">
        Delete
      </button>
    </div>
  );
}
