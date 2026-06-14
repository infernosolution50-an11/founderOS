import { cn } from "@/lib/utils";
import Image from "next/image";

type AvatarProps = {
  name?: string | null;
  src?: string | null;
  className?: string;
};

function initials(name?: string | null) {
  if (!name) return "FO";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({ name, src, className }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? "User"}
        width={36}
        height={36}
        className={cn("h-9 w-9 rounded-full border border-os-border object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-os-border bg-os-panel font-display text-os-xs font-semibold text-os-text",
        className
      )}
      aria-label={name ?? "FounderOS user"}
    >
      {initials(name)}
    </span>
  );
}
