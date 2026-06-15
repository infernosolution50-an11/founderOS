"use client";

import { useEffect, useMemo, useState } from "react";
import { Command, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export type CommandPaletteItem = {
  id: string;
  label: string;
  description?: string;
  category: "Opportunities" | "Tasks" | "Ember" | "Settings";
  onSelect: () => void;
};

type CommandPaletteProps = {
  items: CommandPaletteItem[];
  compact?: boolean;
};

function scoreItem(item: CommandPaletteItem, query: string) {
  const haystack = `${item.label} ${item.description ?? ""} ${item.category}`.toLowerCase();
  const needle = query.toLowerCase().trim();
  if (!needle) return 1;
  let score = 0;
  let index = 0;
  for (const char of needle) {
    const found = haystack.indexOf(char, index);
    if (found === -1) return 0;
    score += found === index ? 2 : 1;
    index = found + 1;
  }
  return score;
}

export function CommandPalette({ items, compact }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(
    () =>
      items
        .map((item) => ({ item, score: scoreItem(item, query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item)
        .slice(0, 12),
    [items, query]
  );

  useEffect(() => setActiveIndex(0), [query, open]);

  function select(item: CommandPaletteItem) {
    item.onSelect();
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size={compact ? "icon" : "md"}
        onClick={() => setOpen(true)}
        leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
        aria-label="Open search"
      >
        Search
      </Button>
      <Dialog open={open} title="Command palette" onClose={() => setOpen(false)}>
        <div
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, results.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            }
            if (event.key === "Enter" && results[activeIndex]) {
              event.preventDefault();
              select(results[activeIndex]);
            }
          }}
        >
          <Input
            label="Search FounderOS"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find opportunities, tasks, Ember commands..."
            autoFocus
            rightSlot={<Command className="h-4 w-4 text-os-muted" aria-hidden="true" />}
          />
          <div className="mt-4 space-y-2">
            {results.map((item, index) => (
              <button
                type="button"
                key={item.id}
                onClick={() => select(item)}
                className={cn(
                  "motion-safe-transition flex min-h-11 w-full items-center justify-between rounded-os-md border px-3 py-2 text-left",
                  activeIndex === index ? "border-os-indigo bg-os-indigo/15" : "border-os-border bg-os-panel hover:bg-os-surface"
                )}
              >
                <span>
                  <span className="block font-display text-os-sm font-medium text-os-text">{item.label}</span>
                  {item.description && <span className="block text-os-xs text-os-sub">{item.description}</span>}
                </span>
                <span className="text-os-xs text-os-muted">{item.category}</span>
              </button>
            ))}
            {results.length === 0 && <p className="rounded-os-md border border-os-border bg-os-panel p-4 text-os-sm text-os-sub">No results. Try an opportunity name, task, or Ember command.</p>}
          </div>
        </div>
      </Dialog>
    </>
  );
}
