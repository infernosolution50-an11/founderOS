"use client";

import { ReactNode, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type TooltipProps = {
  content: ReactNode;
  className?: string;
};

export function Tooltip({ content, className }: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        type="button"
        aria-label="Field explanation"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-os-muted hover:bg-os-panel hover:text-os-text focus:outline-none focus:ring-2 focus:ring-os-indigo"
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-os-md border border-os-border bg-os-bg px-3 py-2 text-left text-os-xs leading-5 text-os-text shadow-os-lg",
          open ? "opacity-100" : "opacity-0",
          "motion-safe-transition"
        )}
      >
        {content}
      </span>
    </span>
  );
}

type FieldLabelProps = {
  label: ReactNode;
  tooltip?: ReactNode;
  className?: string;
};

export function FieldLabel({ label, tooltip, className }: FieldLabelProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span>{label}</span>
      {tooltip && <Tooltip content={tooltip} />}
    </span>
  );
}

