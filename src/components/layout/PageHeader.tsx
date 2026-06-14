import { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow = "FounderOS", title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-display text-os-xs font-medium uppercase tracking-[0.28em] text-os-indigo">{eyebrow}</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-os-text md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-os-sm leading-6 text-os-sub md:text-base">{description}</p>}
      </div>
      {action}
    </header>
  );
}
