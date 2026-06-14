import { TextareaHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function Textarea({ className, id, label, error, helperText, rows = 4, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const messageId = `${textareaId}-message`;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={textareaId} className="font-display text-os-xs font-medium uppercase tracking-[0.16em] text-os-sub">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? messageId : undefined}
        className={cn(
          "w-full resize-y rounded-os-md border bg-os-panel px-3 py-2 text-os-sm leading-6 text-os-text placeholder:text-os-muted focus:border-os-indigo focus:bg-os-surface",
          error ? "border-os-red" : "border-os-border",
          className
        )}
        {...props}
      />
      {(error || helperText) && (
        <p id={messageId} className={cn("text-os-xs", error ? "text-os-red" : "text-os-muted")}>
          {error ?? helperText}
        </p>
      )}
    </div>
  );
}
