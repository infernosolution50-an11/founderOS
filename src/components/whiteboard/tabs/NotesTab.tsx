import { DocUpload } from "@/components/whiteboard/DocUpload";
import { formatBytes } from "@/lib/utils";
import type { WhiteboardTabProps } from "./types";
import { FileUp } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export function NotesTab({ opportunity, notes, documents, onNotesChange, onAgentAction }: WhiteboardTabProps) {
  return (
    <div className="space-y-5">
      {[
        ["thesis", "Thesis"],
        ["customer_notes", "Customer discovery notes"],
        ["open_questions", "Open questions"]
      ].map(([key, label]) => (
        <label key={key} className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
          {label}
          <textarea
            value={String(notes[key as keyof typeof notes] ?? "")}
            onChange={(event) => onNotesChange({ [key]: event.target.value })}
            rows={5}
            className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo"
          />
        </label>
      ))}

      <button type="button" onClick={() => onAgentAction("Synthesize these notes")} className="rounded-xl bg-os-indigo px-4 py-3 font-semibold text-white">
        Synthesize
      </button>

      <DocUpload opportunityId={opportunity.id} />

      <section className="rounded-2xl border border-os-border bg-os-surface p-4">
        <h2 className="font-display text-lg font-semibold text-os-text">Uploaded documents</h2>
        <div className="mt-4 space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="flex items-center justify-between gap-3 rounded-xl border border-os-border bg-os-panel px-3 py-2">
              <div>
                <p className="text-sm text-os-text">{document.filename}</p>
                <p className="text-xs text-os-sub">
                  {formatBytes(document.file_size_bytes)} · {new Date(document.created_at).toLocaleDateString()}
                </p>
              </div>
              <button type="button" onClick={() => onAgentAction(`Synthesize document: ${document.filename}`)} className="text-sm text-os-indigo">
                Synthesize with Ember
              </button>
            </div>
          ))}
          {documents.length === 0 && (
            <EmptyState
              icon={<FileUp className="h-5 w-5" aria-hidden="true" />}
              title="Upload a pitch deck, brief, or research doc."
              description="Ember will synthesize it against your opportunity, surface contradictions, and turn the evidence into sharper next steps."
            />
          )}
        </div>
      </section>
    </div>
  );
}
