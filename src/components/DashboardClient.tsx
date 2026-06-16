"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Rocket, Search, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { OpportunityCardSkeleton } from "@/components/ui/Skeleton";
import { toast } from "@/components/ui/toast";
import { OpportunityScore } from "@/components/whiteboard/OpportunityScore";
import { useCreateOpportunity, useDeleteOpportunity, useOpportunities } from "@/hooks/useOpportunity";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

export function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mainRef = useRef<HTMLElement>(null);
  const { data, isLoading, refetch } = useOpportunities();
  const createOpportunity = useCreateOpportunity();
  const deleteOpportunity = useDeleteOpportunity();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "score" | "name">("newest");
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [intakeName, setIntakeName] = useState("");
  const [intakeIdea, setIntakeIdea] = useState("");
  const handledExample = useRef(false);

  usePullToRefresh(mainRef, async () => {
    await refetch();
  });

  const createNewOpportunity = useCallback(async (example = false, intake?: { name: string; idea: string }) => {
    try {
      const { opportunity } = await createOpportunity.mutateAsync(
        example ? { example: true } : intake ? { name: intake.name, idea: intake.idea, useEmberAutofill: true } : undefined
      );
      toast.success(intake ? "Ember built your first-pass whiteboard." : "Opportunity created.");
      setIsIntakeOpen(false);
      setIntakeName("");
      setIntakeIdea("");
      router.push(`/opportunity/${opportunity.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create opportunity", () => createNewOpportunity(example, intake));
    }
  }, [createOpportunity, router]);

  function submitIntake() {
    const name = intakeName.trim();
    const idea = intakeIdea.trim();
    if (!name || !idea) {
      toast.error("Add a name and a short idea description so Ember has enough signal.");
      return;
    }
    createNewOpportunity(false, { name, idea });
  }

  const copyDemoOpportunity = useCallback(async (sourceDemoId: string) => {
    try {
      const { opportunity } = await createOpportunity.mutateAsync({ sourceDemoId });
      toast.success("Demo copied to your workspace.");
      router.push(`/opportunity/${opportunity.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not copy demo", () => copyDemoOpportunity(sourceDemoId));
    }
  }, [createOpportunity, router]);

  useEffect(() => {
    if (handledExample.current || isLoading || createOpportunity.isPending) return;
    if (searchParams.get("example") !== "true") return;

    handledExample.current = true;
    createNewOpportunity(true);
  }, [createNewOpportunity, createOpportunity.isPending, isLoading, searchParams]);

  const opportunities = useMemo(() => {
    const items = data?.opportunities ?? [];
    const needle = query.trim().toLowerCase();
    return [...items]
      .filter((opportunity) => {
        if (!needle) return true;
        return [opportunity.name, opportunity.phase, opportunity.business_model, opportunity.acv].some((value) =>
          String(value ?? "").toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => {
        if (sort === "score") return b.opportunity_score - a.opportunity_score;
        if (sort === "name") return a.name.localeCompare(b.name);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [data?.opportunities, query, sort]);

  function confirmDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This removes the opportunity, tasks, notes, messages, and uploaded documents.`)) return;

    deleteOpportunity.mutate(id, {
      onSuccess: () => toast.success("Opportunity deleted."),
      onError: () => toast.error("Couldn't delete opportunity — tap to retry", () => confirmDelete(id, name))
    });
  }

  return (
    <main ref={mainRef} className="min-h-screen overflow-y-auto p-4 md:p-8">
      <PageHeader
        title="Opportunities"
        description="Research new business opportunities and sprint toward traction with Ember."
        action={
          <Button type="button" variant="primary" size="lg" loading={createOpportunity.isPending} onClick={() => setIsIntakeOpen(true)} leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
            Create opportunity
          </Button>
        }
      />

      <section className="mt-8 grid gap-3 rounded-os-md border border-os-border bg-os-surface p-4 md:grid-cols-[1fr_auto]">
        <Input
          label="Search opportunities"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, phase, model, or ACV"
          rightSlot={<Search className="h-4 w-4 text-os-muted" aria-hidden="true" />}
        />
        <label className="grid gap-1.5">
          <span className="font-display text-os-xs font-medium uppercase tracking-[0.16em] text-os-sub">Sort</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="h-11 min-h-11 rounded-os-md border border-os-border bg-os-panel px-3 text-os-sm text-os-text md:h-9 md:min-h-9"
          >
            <option value="newest">Newest</option>
            <option value="score">Highest score</option>
            <option value="name">Name</option>
          </select>
        </label>
      </section>

      {isLoading ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <OpportunityCardSkeleton key={item} />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} variant="interactive" className="p-5">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/opportunity/${opportunity.id}`} className="font-display text-xl font-semibold text-os-text hover:text-os-indigo">
                  {opportunity.name}
                </Link>
                <OpportunityScore score={opportunity.opportunity_score} />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {opportunity.is_demo && <Badge tone="indigo">Demo</Badge>}
                <Badge>{opportunity.phase}</Badge>
                <Badge>{new Date(opportunity.created_at).toLocaleDateString()}</Badge>
              </div>
              <div className="mt-4 rounded-os-md border border-os-border bg-os-panel px-3 py-2">
                <p className="text-os-xs font-semibold uppercase tracking-[0.14em] text-os-sub">Next task</p>
                <p className={opportunity.next_task ? "mt-1 truncate text-os-sm text-os-text" : "mt-1 text-os-sm text-os-muted"}>
                  {opportunity.next_task?.text ?? "No tasks yet"}
                </p>
              </div>
              {opportunity.is_demo ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="mt-6"
                  loading={createOpportunity.isPending}
                  onClick={() => copyDemoOpportunity(opportunity.id)}
                >
                  Copy to my workspace
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="mt-6"
                  onClick={() => confirmDelete(opportunity.id, opportunity.name)}
                >
                  Delete
                </Button>
              )}
            </Card>
          ))}
          {data?.opportunities.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState
                icon={<Rocket className="h-5 w-5" aria-hidden="true" />}
                title="You haven't added an opportunity yet."
                description="Every billion-dollar company started here. Create a blank whiteboard or start with a worked example so Ember can show you what good looks like."
                action={
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="primary" size="lg" onClick={() => setIsIntakeOpen(true)} loading={createOpportunity.isPending}>
                      Create your first opportunity
                    </Button>
                    <Button type="button" variant="secondary" size="lg" onClick={() => createNewOpportunity(true)} disabled={createOpportunity.isPending}>
                      Start with an example opportunity
                    </Button>
                  </div>
                }
              />
            </div>
          )}
          {(data?.opportunities.length ?? 0) > 0 && opportunities.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState
                icon={<Search className="h-5 w-5" aria-hidden="true" />}
                title="No opportunities match that search."
                description="Try a different name, phase, market, or ACV."
                action={
                  <Button type="button" variant="secondary" size="lg" onClick={() => setQuery("")}>
                    Clear search
                  </Button>
                }
              />
            </div>
          )}
        </div>
      )}
      {isIntakeOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-os-lg border border-os-border bg-os-surface p-5 shadow-os-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-os-text">Build with Ember</h2>
                <p className="mt-1 text-os-sm text-os-sub">Give Ember the minimum signal. She will create the opportunity, populate the whiteboard, score the thesis, and generate starting tasks.</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsIntakeOpen(false)} disabled={createOpportunity.isPending}>
                Close
              </Button>
            </div>
            <div className="mt-5 grid gap-4">
              <Input
                label="Opportunity name"
                value={intakeName}
                onChange={(event) => setIntakeName(event.target.value)}
                placeholder="AI procurement copilot"
                disabled={createOpportunity.isPending}
              />
              <label className="grid gap-1.5">
                <span className="font-display text-os-xs font-medium uppercase tracking-[0.16em] text-os-sub">Describe the idea in 1-3 sentences</span>
                <textarea
                  value={intakeIdea}
                  onChange={(event) => setIntakeIdea(event.target.value)}
                  rows={5}
                  disabled={createOpportunity.isPending}
                  placeholder="Who has the problem, what hurts today, and what you think the product does..."
                  className="w-full rounded-os-md border border-os-border bg-os-panel px-3 py-2 text-os-sm text-os-text placeholder:text-os-muted focus:border-os-indigo disabled:opacity-50"
                />
              </label>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" size="lg" onClick={() => setIsIntakeOpen(false)} disabled={createOpportunity.isPending}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="lg" loading={createOpportunity.isPending} onClick={submitIntake} leftIcon={<Sparkles className="h-4 w-4" aria-hidden="true" />}>
                Let Ember build it
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
