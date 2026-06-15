import type { Task } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type TaskItemProps = {
  task: Task;
  onToggle: (done: boolean) => void;
  onDelete: () => void;
};

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  let startX = 0;

  return (
    <Card
      variant="interactive"
      className="relative flex items-start gap-3 overflow-hidden"
      onTouchStart={(event) => {
        startX = event.touches[0]?.clientX ?? 0;
      }}
      onTouchEnd={(event) => {
        const endX = event.changedTouches[0]?.clientX ?? startX;
        const delta = endX - startX;
        if (delta > 72) onToggle(true);
        if (delta < -96) onDelete();
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(!task.done)}
        aria-label={task.done ? "Mark task not done" : "Mark task done"}
        className={cn(
          "motion-safe-transition mt-0.5 flex h-11 min-h-11 w-11 min-w-11 items-center justify-center rounded-full border md:h-8 md:min-h-8 md:w-8 md:min-w-8",
          task.done ? "border-os-green bg-os-green/15" : "border-os-border bg-os-surface"
        )}
      >
        <span className={cn("h-3 w-3 rounded-full", task.done ? "scale-100 bg-os-green" : "scale-75 bg-os-border")} />
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("text-os-sm text-os-text", task.done && "text-os-muted line-through decoration-os-green decoration-2")}>{task.text}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge className="capitalize">{task.category}</Badge>
          <Badge>{task.phase}</Badge>
          <Badge tone={task.priority === "high" ? "amber" : "neutral"} className="capitalize">
            {task.priority}
          </Badge>
          {task.due_date && <Badge>{new Date(`${task.due_date}T00:00:00`).toLocaleDateString()}</Badge>}
        </div>
      </div>
      <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
        Delete
      </Button>
    </Card>
  );
}
