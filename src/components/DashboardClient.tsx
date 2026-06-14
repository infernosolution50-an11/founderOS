"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Plus, Rocket } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { OpportunityCardSkeleton } from "@/components/ui/Skeleton";
import { toast } from "@/components/ui/toast";
import { OpportunityScore } from "@/components/whiteboard/OpportunityScore";
import { useCreateOpportunity, useDeleteOpportunity, useOpportunities } from "@/hooks/useOpportunity";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

export function DashboardClient() {
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const { data, isLoading, refetch } = useOpportunities();
  const createOpportunity = useCreateOpportunity();
  const deleteOpportunity = useDeleteOpportunity();
  usePullToRefresh(mainRef, async () => {
    await refetch();
  });

  async function createNewOpportunity(example = false) {
    try {
      const { opportunity } = await createOpportunity.mutateAsync(example ? { example: true } : undefined);
      toast.success("Opportunity created.");
      router.push(`/opportunity/${opportunity.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create opportunity", () => createNewOpportunity(example));
    }
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

      {isLoading ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <OpportunityCardSkeleton key={item} />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.opportunities.map((opportunity) => (
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
                onClick={() =>
                  deleteOpportunity.mutate(opportunity.id, {
                    onSuccess: () => toast.success("Opportunity deleted."),
                    onError: () => toast.error("Couldn't delete opportunity — tap to retry", () => deleteOpportunity.mutate(opportunity.id))
                  })
                }
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
        </div>
      )}
    </main>
  );
}
