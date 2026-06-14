import { Card } from "@/components/ui/Card";

export function TimelineItem({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <div className="font-display text-sm font-semibold text-os-text">{title}</div>
      <p className="mt-2 text-sm leading-6 text-os-sub">{body}</p>
    </Card>
  );
}
