import { AlertTriangle, BarChart3, Brain, ListChecks } from "lucide-react";

const agents = [
  { icon: Brain, tone: "bg-os-indigo/15 text-os-indigo", name: "Ember Core", description: "General co-founder intelligence" },
  { icon: BarChart3, tone: "bg-os-amber/15 text-os-amber", name: "Market Intel", description: "TAM, competitors, go-to-market" },
  { icon: AlertTriangle, tone: "bg-os-red/15 text-os-red", name: "Risk Analyst", description: "Stress-tests your thesis" },
  { icon: ListChecks, tone: "bg-os-green/15 text-os-green", name: "Execution Planner", description: "90-day sprint and task plans" }
];

export function EmberSection() {
  return (
    <section className="border-y border-os-border bg-os-surface px-4 py-20 md:px-8">
      <div className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-2 md:items-center">
        <div>
          <p className="font-display text-os-xs font-medium uppercase tracking-[0.18em] text-os-indigo">Meet Ember</p>
          <h2 className="mt-3 font-display text-[22px] font-bold text-os-text md:text-[28px]">Six specialist agents. One co-founder.</h2>
          <p className="mt-4 max-w-xl text-os-sm leading-7 text-os-sub md:text-base">
            Ember isn&apos;t a chatbot. It&apos;s six purpose-built intelligence agents that read your whiteboard and give you specific, actionable, numbers-first analysis — not generic advice.
          </p>
        </div>
        <div className="grid gap-3">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={agent.name} className="flex items-center gap-3 rounded-os-sm border border-os-border bg-os-panel px-3 py-2.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-os-sm ${agent.tone}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-os-sm font-semibold text-os-text">{agent.name}</p>
                  <p className="text-os-xs text-os-muted">{agent.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
