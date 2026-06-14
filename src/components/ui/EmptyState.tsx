import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-start gap-4 border-dashed p-6 md:p-8">
      <div className="flex h-11 w-11 items-center justify-center rounded-os-md border border-os-border bg-os-surface text-os-indigo">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-os-text">{title}</h3>
        <p className="mt-2 max-w-xl text-os-sm leading-6 text-os-sub">{description}</p>
      </div>
      {action}
    </Card>
  );
}
