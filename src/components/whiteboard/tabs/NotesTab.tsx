import { DocUpload } from "@/components/whiteboard/DocUpload";
import { formatBytes } from "@/lib/utils";
import type { WhiteboardTabProps } from "./types";
import { Download, FileUp, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/toast";
import { FieldLabel } from "@/components/ui/Tooltip";
import { fieldTooltips } from "@/lib/fieldTooltips";

export function NotesTab({ opportunity, notes, documents, isReadOnly, onNotesChange, onAgentAction, onFillSection, onFieldUpdates, onDocumentsChanged }: WhiteboardTabProps) {
  async function downloadDocument(id: string) {
    const response = await fetch(`/api/documents/${id}`);
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.url) {
      toast.error(payload?.error ?? "Could not create download link.");
      return;
    }
    window.open(payload.url, "_blank", "noopener,noreferrer");
  }

  function addDecision() {
    if (isReadOnly) return;
    onNotesChange({
      decision_log: [
        ...(notes.decision_log ?? []),
        { id: crypto.randomUUID(), body: "New decision", created_at: new Date().toISOString() }
      ]
    });
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
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Notes</h2>
        <Button type="button" variant="secondary" size="sm" disabled={isReadOnly} onClick={() => onFillSection?.("Notes")}>
          Ask Ember to fill this section
        </Button>
      </div>
      {[
        ["thesis", "Thesis"],
        ["customer_notes", "Customer discovery notes"],
        ["open_questions", "Open questions"],
        ["kill_conditions", "Kill conditions"],
        ["moat_insight", "Moat insight"]
      ].map(([key, label]) => (
        <label key={key} className="block rounded-2xl border border-os-border bg-os-surface p-4 text-sm text-os-sub">
          <FieldLabel label={label} tooltip={fieldTooltips[key as keyof typeof fieldTooltips]} />
          <textarea
            value={String(notes[key as keyof typeof notes] ?? "")}
            onChange={(event) => onNotesChange({ [key]: event.target.value })}
            rows={5}
            disabled={isReadOnly}
            className="mt-2 w-full rounded-xl border border-os-border bg-os-panel px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
          />
        </label>
      ))}

      <section className="rounded-2xl border border-os-border bg-os-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-os-text">
            <FieldLabel label="Decision log" tooltip={fieldTooltips.decision_log} />
          </h2>
          <Button type="button" variant="secondary" size="sm" disabled={isReadOnly} onClick={addDecision}>
            Add decision
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {(notes.decision_log ?? []).map((entry, index) => (
            <div key={entry.id} className="rounded-xl border border-os-border bg-os-panel p-3">
              <p className="text-os-xs text-os-muted">{new Date(entry.created_at).toLocaleString()}</p>
              <textarea
                value={entry.body}
                disabled={isReadOnly}
                onChange={(event) =>
                  onNotesChange({
                    decision_log: notes.decision_log.map((item, itemIndex) => (itemIndex === index ? { ...item, body: event.target.value } : item))
                  })
                }
                rows={2}
                className="mt-2 w-full rounded-xl border border-os-border bg-os-surface px-3 py-2 text-os-text focus:border-os-indigo disabled:opacity-50"
              />
            </div>
          ))}
        </div>
      </section>

      <button type="button" disabled={isReadOnly} onClick={() => onAgentAction("Synthesize these notes")} className="rounded-xl bg-os-indigo px-4 py-3 font-semibold text-white disabled:opacity-50">
        Synthesize
      </button>

      <DocUpload opportunityId={opportunity.id} disabled={isReadOnly} onSynthesized={() => onDocumentsChanged?.()} onFieldUpdates={onFieldUpdates} />

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
