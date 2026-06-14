import { AlertTriangle, BarChart3, FileUp, ListChecks, Microscope, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: Microscope,
    title: "Research mode",
    description: "Score problem strength, founder edge, and timing signals with structured inputs."
  },
  {
    icon: BarChart3,
    title: "Market analysis",
    description: "TAM/SAM/SOM sizing, competitor heat map, business model selection."
  },
  {
    icon: Shield,
    title: "Moat scoring",
    description: "Rate six defensibility dimensions. See exactly where you're vulnerable before competitors do."
  },
  {
    icon: ListChecks,
    title: "Execution board",
    description: "Phase-gated task board from 0→1 through 10→100 with 90-day sprint targets."
  },
  {
    icon: FileUp,
    title: "Document upload",
    description: "Upload pitch decks or research briefs. Ember synthesizes them directly into your whiteboard."
  },
  {
    icon: AlertTriangle,
    title: "Risk register",
    description: "Heat-mapped risk tracking with kill conditions before you commit runway."
  }
];

export function FeatureGrid() {
  return (
    <section className="px-4 py-20 md:px-8">
      <div className="mx-auto max-w-[1100px]">
        <p className="font-display text-os-xs font-medium uppercase tracking-[0.18em] text-os-indigo">What&apos;s inside</p>
        <h2 className="mt-3 font-display text-[22px] font-bold text-os-text md:text-[28px]">Every tool a serious founder needs</h2>
        <p className="mt-3 max-w-2xl text-os-sm leading-6 text-os-sub">
          Six structured modules that take you from raw idea to first traction — in the same workspace.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-os-sm bg-os-indigo/15 text-os-indigo">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-sm font-semibold text-os-text">{feature.title}</h3>
                <p className="mt-2 text-os-sm leading-6 text-os-sub">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
