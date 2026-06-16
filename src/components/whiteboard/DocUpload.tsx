"use client";

import { useCallback, useState } from "react";
import { Paperclip, Sparkles, Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/toast";
import type { DocumentRecord, Opportunity } from "@/types";

type DocUploadProps = {
  opportunityId: string;
  compact?: boolean;
  onSynthesized?: (message: string) => void;
  onFieldUpdates?: (payload: unknown) => void;
  pendingDocumentAction?: DocumentRecord | null;
  onPendingDocumentActionChange?: (document: DocumentRecord | null) => void;
  disabled?: boolean;
};

export function DocUpload({ opportunityId, compact, onSynthesized, onFieldUpdates, pendingDocumentAction, onPendingDocumentActionChange, disabled }: DocUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [streamText, setStreamText] = useState("");
  const [localPendingDocumentAction, setLocalPendingDocumentAction] = useState<DocumentRecord | null>(null);
  const activePendingDocumentAction = pendingDocumentAction !== undefined ? pendingDocumentAction : localPendingDocumentAction;

  const updatePendingDocumentAction = useCallback(
    (document: DocumentRecord | null) => {
      setLocalPendingDocumentAction(document);
      onPendingDocumentActionChange?.(document);
    },
    [onPendingDocumentActionChange]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      if (disabled) return;
      setUploading(true);
      setStreamText("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("opportunityId", opportunityId);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok || !response.body) {
          const error = await response.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(error.error);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            const line = event.split("\n").find((part) => part.startsWith("data: "));
            if (!line) continue;
            const payload = JSON.parse(line.slice(6));
            if (payload.type === "delta") {
              fullText += payload.text;
              setStreamText((current) => current + payload.text);
            }
            if (payload.type === "field_updates") {
              onFieldUpdates?.(payload.payload);
            }
            if (payload.document) {
              updatePendingDocumentAction(payload.document);
            }
          }
        }

        toast.success("Document uploaded.");
        onSynthesized?.(fullText || `Uploaded document: ${file.name}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [disabled, opportunityId, onFieldUpdates, onSynthesized, updatePendingDocumentAction]
  );

  async function runDocumentChat(action: "Extract key insights" | "Summarize") {
    if (!activePendingDocumentAction) return;
    setActing(action);
    setStreamText("");
    try {
      const response = await fetch("/api/ember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          agentType: "doc_synthesizer",
          message: `${action}: ${activePendingDocumentAction.filename}`,
          extraContext: `Document ${activePendingDocumentAction.filename} content:\n${activePendingDocumentAction.extracted_text ?? "(no text extracted)"}`
        })
      });
      if (!response.ok || !response.body) throw new Error("Ember could not read this document.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          const line = event.split("\n").find((part) => part.startsWith("data: "));
          if (!line) continue;
          const payload = JSON.parse(line.slice(6));
          if (payload.type === "delta") {
            fullText += payload.text;
            setStreamText((current) => current + payload.text);
          }
        }
      }
      onSynthesized?.(fullText);
      updatePendingDocumentAction(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ember could not read this document.");
    } finally {
      setActing(null);
    }
  }

  async function fillRelevantFields() {
    if (!activePendingDocumentAction) return;
    setActing("Fill relevant fields");
    try {
      const response = await fetch("/api/ember/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          action: "fill_fields",
          allowedFields: documentFillFields,
          context: `Document ${activePendingDocumentAction.filename} content:\n${activePendingDocumentAction.extracted_text ?? "(no text extracted)"}`,
          fillBlanksOnly: true
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Ember could not fill fields from this document.");
      onFieldUpdates?.(payload.fill);
      toast.success("Ember filled relevant blank fields.");
      updatePendingDocumentAction(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ember could not fill fields from this document.");
    } finally {
      setActing(null);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    },
    maxSize: 10 * 1024 * 1024,
    disabled,
    onDrop: (files) => {
      const [file] = files;
      if (file) uploadFile(file);
    }
  });

  if (compact) {
    return (
      <button
        {...getRootProps()}
        type="button"
        disabled={disabled}
        className="rounded-xl border border-os-border bg-os-surface px-3 py-2 text-os-sub hover:text-os-text disabled:cursor-not-allowed disabled:opacity-40"
      >
        <input {...getInputProps()} />
        <Paperclip className="h-5 w-5" />
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-os-border bg-os-surface p-4">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-2xl border border-dashed border-os-border bg-os-panel p-6 text-center transition hover:border-os-indigo"
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-os-indigo" />
        <p className="mt-3 font-display text-sm font-semibold text-os-text">
          {disabled ? "Copy this demo before uploading documents" : isDragActive ? "Drop the file here" : "Drop a PDF or DOCX, or click to upload"}
        </p>
        <p className="mt-1 text-xs text-os-sub">Maximum 10MB. Uploaded privately to your Supabase bucket.</p>
      </div>

      {uploading && <p className="mt-3 text-sm text-os-sub">Uploading and extracting text...</p>}
      {activePendingDocumentAction && (
        <div className="mt-4 rounded-2xl border border-os-indigo/40 bg-os-indigo/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="flex items-center gap-2 text-sm text-os-text">
              <Sparkles className="h-4 w-4 text-os-indigo" aria-hidden="true" />
              {`I've read "${activePendingDocumentAction.filename}". What would you like me to do?`}
            </p>
            <button type="button" aria-label="Dismiss document actions" onClick={() => updatePendingDocumentAction(null)} className="rounded-full p-1 text-os-sub hover:bg-os-panel hover:text-os-text">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" loading={acting === "Extract key insights"} disabled={Boolean(acting)} onClick={() => runDocumentChat("Extract key insights")}>Extract key insights</Button>
            <Button type="button" variant="secondary" size="sm" loading={acting === "Fill relevant fields"} disabled={Boolean(acting)} onClick={fillRelevantFields}>Fill relevant fields</Button>
            <Button type="button" variant="secondary" size="sm" loading={acting === "Summarize"} disabled={Boolean(acting)} onClick={() => runDocumentChat("Summarize")}>Summarize</Button>
          </div>
        </div>
      )}
      {streamText && (
        <div className="mt-4 rounded-2xl border border-os-border bg-os-bg p-4 text-sm leading-6 text-os-text">
          <p className="whitespace-pre-wrap">{streamText}</p>
        </div>
      )}
    </section>
  );
}

const documentFillFields: (keyof Opportunity)[] = [
  "problem_statement",
  "target_customer_persona",
  "key_insight",
  "falsifiable_hypothesis",
  "timing_signals",
  "market_type",
  "business_model",
  "pricing_model",
  "acv",
  "tam_m",
  "sam_m",
  "som_m",
  "growth_rate_pct",
  "competitors",
  "moat_summary",
  "kpi_primary",
  "kpi_revenue",
  "kpi_learning",
  "sprint_goal_90_day",
  "next_fundraise_trigger",
  "signal_notes"
];
