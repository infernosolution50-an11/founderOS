import { DocUpload } from "@/components/whiteboard/DocUpload";
import { formatBytes } from "@/lib/utils";
import type { WhiteboardTabProps } from "./types";
import { Download, FileUp, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/toast";

export function NotesTab({ opportunity, notes, documents, onNotesChange, onAgentAction, onDocumentsChanged }: WhiteboardTabProps) {
  async function downloadDocument(id: string) {
    const response = await fetch(`/api/documents/${id}`);
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.url) {
      toast.error(payload?.error ?? "Could not create download link.");
      return;
    }
    window.open(payload.url, "_blank", "noopener,noreferrer");
  }

  async function deleteDocument(id: string, filename: string) {
    if (!window.confirm(`Delete "${filename}"? This removes the private storage object too.`)) return;

    const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? "Could not delete document.");
      return;
    }

    toast.success("Document deleted.");
    await onDocumentsChanged?.();
  }

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

      <DocUpload opportunityId={opportunity.id} onSynthesized={() => onDocumentsChanged?.()} />

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
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => onAgentAction(`Synthesize document: ${document.filename}`)}>
                  Synthesize
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => downloadDocument(document.id)} leftIcon={<Download className="h-4 w-4" aria-hidden="true" />}>
                  Download
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => deleteDocument(document.id, document.filename)} leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}>
                  Delete
                </Button>
              </div>
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
