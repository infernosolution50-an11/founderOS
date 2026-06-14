import { Badge } from "@/components/ui/Badge";

function PreviewSlider({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-os-md border border-os-border bg-os-panel p-3">
      <div className="flex items-center justify-between text-os-xs">
        <span className="font-display font-medium text-os-text">{label}</span>
        <span className="text-os-sub">{value}</span>
      </div>
      <div className="mt-3 h-1 rounded-full bg-os-border">
        <div className="h-full rounded-full bg-os-indigo" style={{ width: value }} />
      </div>
    </div>
  );
}

export function ProductPreview() {
  return (
    <section className="px-4 pb-20 md:px-8">
      <div className="mx-auto max-w-[780px] overflow-hidden rounded-os-md border border-os-border-strong bg-os-surface">
        <div className="flex items-center gap-3 border-b border-os-border px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-os-red" />
            <span className="h-2.5 w-2.5 rounded-full bg-os-amber" />
            <span className="h-2.5 w-2.5 rounded-full bg-os-green" />
          </div>
          <div className="min-w-0 flex-1 rounded-full border border-os-border bg-os-bg px-3 py-1 text-center font-display text-os-xs text-os-sub">
            AI Health Diagnostics Platform
          </div>
          <Badge tone="amber">74</Badge>
        </div>

        <div className="grid md:grid-cols-[52fr_48fr]">
          <div className="hidden border-r border-os-border p-4 md:block">
            <div className="mb-4 flex gap-2">
              <Badge tone="indigo">Research</Badge>
              <Badge>Market</Badge>
              <Badge>Moat</Badge>
            </div>
            <div className="grid gap-3">
              <PreviewSlider label="Urgency" value="78%" />
              <PreviewSlider label="Pain level" value="84%" />
              <PreviewSlider label="WTP" value="72%" />
              <div className="rounded-os-md border border-os-border bg-os-panel p-3">
                <p className="font-display text-os-xs font-medium text-os-text">Founder edge</p>
                <div className="mt-3 flex gap-2">
                  {[0, 1, 2, 3, 4].map((dot) => (
                    <span key={dot} className={dot < 4 ? "h-3 w-3 rounded-full bg-os-indigo" : "h-3 w-3 rounded-full bg-os-border"} />
                  ))}
                </div>
              </div>
              <Badge tone="indigo" className="w-fit">
                New technology
              </Badge>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-4">
              <p className="font-display text-lg font-semibold text-os-text">Ember</p>
              <p className="text-os-xs text-os-sub">Market Intel</p>
            </div>
            <div className="space-y-3">
              <div className="rounded-os-md border border-os-border bg-os-panel p-4 text-os-sm leading-6 text-os-text">
                1. The pain is real if buyers feel it weekly. Your urgency at 8 and WTP at 7 suggest a sellable wedge, but only if diagnostics teams own budget.
              </div>
              <div className="ml-auto max-w-[86%] rounded-os-md bg-os-indigo p-4 text-os-sm leading-6 text-white">
                What should I validate first?
              </div>
              <div className="rounded-os-md border border-os-border bg-os-panel p-4 text-os-sm leading-6 text-os-text">
                2. Validate reimbursement pressure before product. Talk to 10 clinic operators and ask what a false negative costs them this quarter.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
