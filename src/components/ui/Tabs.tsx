"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TabItem<T extends string> = {
  value: T;
  label: ReactNode;
};

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function Tabs<T extends string>({ items, value, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn("scrollbar-thin -mx-1 overflow-x-auto px-1", className)} role="tablist">
      <div className="flex min-w-max gap-2 md:min-w-0">
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.value)}
              className={cn(
                "motion-safe-transition min-h-11 rounded-full border px-4 font-display text-os-sm font-medium active:scale-[0.97] md:min-h-9",
                active
                  ? "border-os-indigo bg-os-indigo/20 text-os-text"
                  : "border-os-border bg-transparent text-os-sub hover:bg-os-panel hover:text-os-text"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
