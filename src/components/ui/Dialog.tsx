"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export function Modal({ open, title, children, onClose, footer }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal hidden items-center justify-center bg-os-overlay p-4 md:flex" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-xl rounded-os-md border border-os-border-strong bg-os-surface"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-os-border px-5 py-4">
          <h2 id="dialog-title" className="font-display text-lg font-semibold text-os-text">
            {title}
          </h2>
          <Button type="button" size="icon" variant="ghost" onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </header>
        <div className="p-5">{children}</div>
        {footer && <footer className="border-t border-os-border p-4">{footer}</footer>}
      </section>
    </div>
  );
}

export function BottomSheet({ open, title, children, onClose, footer }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-end bg-os-overlay md:hidden" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="animate-sheet-up safe-bottom max-h-[88vh] w-full overflow-y-auto rounded-t-2xl border border-os-border-strong bg-os-surface"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" aria-label="Close sheet" onClick={onClose} className="mx-auto mt-3 block h-1.5 min-h-0 w-12 rounded-full bg-os-border-strong" />
        <header className="flex items-center justify-between px-5 py-4">
          <h2 id="sheet-title" className="font-display text-lg font-semibold text-os-text">
            {title}
          </h2>
          <Button type="button" size="icon" variant="ghost" onClick={onClose} aria-label="Close sheet">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </header>
        <div className="px-5 pb-5">{children}</div>
        {footer && <footer className="border-t border-os-border p-4">{footer}</footer>}
      </section>
    </div>
  );
}

export function Dialog({ open, title, children, onClose, footer }: DialogProps) {
  return (
    <>
      <Modal open={open} title={title} onClose={onClose} footer={footer}>
        {children}
      </Modal>
      <BottomSheet open={open} title={title} onClose={onClose} footer={footer}>
        {children}
      </BottomSheet>
    </>
  );
}

export function DialogFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}>{children}</div>;
}
