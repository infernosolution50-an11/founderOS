"use client";

import { useCallback, useState } from "react";
import { Paperclip, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

type DocUploadProps = {
  opportunityId: string;
  compact?: boolean;
  onSynthesized?: (message: string) => void;
};

export function DocUpload({ opportunityId, compact, onSynthesized }: DocUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [streamText, setStreamText] = useState("");

  const uploadFile = useCallback(
    async (file: File) => {
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
          }
        }

        toast.success("Document uploaded and synthesized.");
        onSynthesized?.(fullText || `Synthesize document: ${file.name}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [opportunityId, onSynthesized]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    },
    maxSize: 10 * 1024 * 1024,
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
        className="rounded-xl border border-os-border bg-os-surface px-3 py-2 text-os-sub hover:text-os-text"
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
          {isDragActive ? "Drop the file here" : "Drop a PDF or DOCX, or click to upload"}
        </p>
        <p className="mt-1 text-xs text-os-sub">Maximum 10MB. Uploaded privately to your Supabase bucket.</p>
      </div>

      {uploading && <p className="mt-3 text-sm text-os-sub">Uploading and synthesizing with Ember...</p>}
      {streamText && (
        <div className="mt-4 rounded-2xl border border-os-border bg-os-bg p-4 text-sm leading-6 text-os-text">
          <p className="whitespace-pre-wrap">{streamText}</p>
        </div>
      )}
    </section>
  );
}
