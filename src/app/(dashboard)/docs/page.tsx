import Link from "next/link";
import { Download, FileUp, RefreshCcw, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

const capabilities = [
  {
    title: "Upload privately",
    description: "PDF and DOCX files are stored in your private Supabase bucket under your user folder.",
    icon: FileUp
  },
  {
    title: "Synthesize with Ember",
    description: "Every upload can stream a Doc Synthesizer readout against the current opportunity context.",
    icon: RefreshCcw
  },
  {
    title: "Download or delete",
    description: "Document rows and storage objects are owned by your account and can be downloaded or removed from the Notes drawer.",
    icon: Download
  },
  {
    title: "Clean lifecycle",
    description: "Deleting an opportunity now attempts to remove its stored files before deleting the opportunity record.",
    icon: Trash2
  }
];

export default function DocsPage() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl">
        <p className="font-display text-os-xs font-semibold uppercase tracking-[0.24em] text-os-indigo">Documents</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-os-text">Docs Workflow</h1>
        <p className="mt-2 max-w-2xl text-os-sm text-os-sub">
          Upload pitch decks, research notes, customer call writeups, or specs from an opportunity’s Notes drawer. Ember uses those documents as evidence for sharper synthesis.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {capabilities.map((capability) => {
            const Icon = capability.icon;
            return (
              <Card key={capability.title} className="p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-os-md bg-os-indigo/15 text-os-indigo">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold text-os-text">{capability.title}</h2>
                <p className="mt-2 text-os-sm leading-6 text-os-sub">{capability.description}</p>
              </Card>
            );
          })}
        </div>

        <Link href="/dashboard" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-os-md border border-os-indigo bg-os-indigo px-5 text-sm font-medium text-white hover:bg-os-indigo/90">
          Go to opportunities
        </Link>
      </div>
    </main>
  );
}

