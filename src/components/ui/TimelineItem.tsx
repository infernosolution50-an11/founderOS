export function TimelineItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-os-border bg-os-surface p-4">
      <div className="font-display text-sm font-semibold text-os-text">{title}</div>
      <p className="mt-2 text-sm leading-6 text-os-sub">{body}</p>
    </div>
  );
}
