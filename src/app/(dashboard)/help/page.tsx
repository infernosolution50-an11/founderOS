import Link from "next/link";
import { BookOpen, MessageCircle, Rocket } from "lucide-react";
import { Card } from "@/components/ui/Card";

const guides = [
  {
    title: "1. Create an opportunity",
    description: "Start blank or use the worked example. FounderOS creates a private whiteboard, notes, Ember thread, and task space.",
    icon: Rocket
  },
  {
    title: "2. Fill the whiteboard",
    description: "Score problem urgency, market shape, founder edge, moat, risks, and execution targets. Changes autosave.",
    icon: BookOpen
  },
  {
    title: "3. Ask Ember",
    description: "Use tab-specific prompt chips to pressure-test your thinking and turn evidence into next actions.",
    icon: MessageCircle
  }
];

export default function HelpPage() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl">
        <p className="font-display text-os-xs font-semibold uppercase tracking-[0.24em] text-os-indigo">FounderOS guide</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-os-text">Help</h1>
        <p className="mt-2 max-w-2xl text-os-sm text-os-sub">
          FounderOS helps you move from raw idea to validated opportunity: research the pain, size the market, build a moat, identify risks, and execute with Ember.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Card key={guide.title} className="p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-os-md bg-os-indigo/15 text-os-indigo">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold text-os-text">{guide.title}</h2>
                <p className="mt-2 text-os-sm leading-6 text-os-sub">{guide.description}</p>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard?example=true" className="inline-flex min-h-12 items-center justify-center rounded-os-md border border-os-indigo bg-os-indigo px-5 text-sm font-medium text-white hover:bg-os-indigo/90">
            Open example opportunity
          </Link>
          <Link href="/docs" className="inline-flex min-h-12 items-center justify-center rounded-os-md border border-os-border px-5 text-sm font-medium text-os-text hover:bg-os-panel">
            Review document workflow
          </Link>
        </div>
      </div>
    </main>
  );
}

