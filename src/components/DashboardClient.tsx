"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Rocket, Search } from "lucide-react";
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
  const handledExample = useRef(false);

  usePullToRefresh(mainRef, async () => {
    await refetch();
  });

  const createNewOpportunity = useCallback(async (example = false) => {
    try {
      const { opportunity } = await createOpportunity.mutateAsync(example ? { example: true } : undefined);
      toast.success("Opportunity created.");
      router.push(`/opportunity/${opportunity.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create opportunity", () => createNewOpportunity(example));
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
          <Button type="button" variant="primary" size="lg" loading={createOpportunity.isPending} onClick={() => createNewOpportunity()} leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
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
                <Badge>{opportunity.phase}</Badge>
                <Badge>{new Date(opportunity.created_at).toLocaleDateString()}</Badge>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-6"
                onClick={() => confirmDelete(opportunity.id, opportunity.name)}
              >
                Delete
              </Button>
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
                    <Button type="button" variant="primary" size="lg" onClick={() => createNewOpportunity()} loading={createOpportunity.isPending}>
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
    </main>
  );
}
