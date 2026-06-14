import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  shape?: "text" | "card" | "circle" | "full";
};

export function Skeleton({ className, shape = "text", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-os-panel",
        shape === "text" && "h-4 rounded-full",
        shape === "card" && "h-36 rounded-os-xl border border-os-border",
        shape === "circle" && "h-10 w-10 rounded-full",
        shape === "full" && "h-full min-h-64 rounded-os-xl border border-os-border",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="rounded-os-xl border border-os-border bg-os-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-8 h-4 w-28" />
      <Skeleton className="mt-5 h-8 w-24 rounded-os-md" />
    </div>
  );
}
