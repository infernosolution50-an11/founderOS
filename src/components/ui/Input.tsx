import { InputHTMLAttributes, ReactNode, useId } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
  rightSlot?: ReactNode;
};

export function Input({ className, id, label, error, helperText, rightSlot, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={inputId} className="font-display text-os-xs font-medium uppercase tracking-[0.16em] text-os-sub">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helperText ? messageId : undefined}
          className={cn(
            "h-11 min-h-11 w-full rounded-os-md border bg-os-panel px-3 text-os-sm text-os-text placeholder:text-os-muted focus:border-os-indigo focus:bg-os-surface md:h-9 md:min-h-9",
            error ? "border-os-red" : "border-os-border",
            rightSlot ? "pr-10" : undefined,
            className
          )}
          {...props}
        />
        {rightSlot && <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {(error || helperText) && (
        <p id={messageId} className={cn("text-os-xs", error ? "text-os-red" : "text-os-muted")}>
          {error ?? helperText}
        </p>
      )}
    </div>
  );
}
