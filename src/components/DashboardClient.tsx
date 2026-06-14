"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OpportunityScore } from "@/components/whiteboard/OpportunityScore";
import { useCreateOpportunity, useDeleteOpportunity, useOpportunities } from "@/hooks/useOpportunity";

export function DashboardClient() {
  const router = useRouter();
  const { data, isLoading } = useOpportunities();
  const createOpportunity = useCreateOpportunity();
  const deleteOpportunity = useDeleteOpportunity();

  async function createNewOpportunity() {
    try {
      const { opportunity } = await createOpportunity.mutateAsync();
      toast.success("Opportunity created.");
      router.push(`/opportunity/${opportunity.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create opportunity");
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.35em] text-os-indigo">FounderOS</p>
          <h1 className="mt-3 font-display text-4xl font-bold">Opportunities</h1>
          <p className="mt-2 text-os-sub">Research new business opportunities and sprint toward traction with Ember.</p>
        </div>
        <button type="button" onClick={createNewOpportunity} className="rounded-xl bg-os-indigo px-5 py-3 font-semibold text-white">
          New Opportunity
        </button>
      </div>

      {isLoading ? (
        <p className="mt-10 text-os-sub">Loading opportunities...</p>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.opportunities.map((opportunity) => (
            <article key={opportunity.id} className="rounded-3xl border border-os-border bg-os-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/opportunity/${opportunity.id}`} className="font-display text-xl font-semibold text-os-text hover:text-os-indigo">
                  {opportunity.name}
                </Link>
                <OpportunityScore score={opportunity.opportunity_score} />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-os-sub">
                <span className="rounded-full bg-os-panel px-3 py-1">{opportunity.phase}</span>
                <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
              </div>
              <button
                type="button"
                onClick={() => deleteOpportunity.mutate(opportunity.id, { onSuccess: () => toast.success("Opportunity deleted.") })}
                className="mt-6 text-sm text-os-muted hover:text-os-red"
              >
                Delete
              </button>
            </article>
          ))}
          {data?.opportunities.length === 0 && (
            <div className="rounded-3xl border border-dashed border-os-border p-10 text-os-sub">
              No opportunities yet. Create one and start sharpening the thesis.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
