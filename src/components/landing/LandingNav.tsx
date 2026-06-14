import Link from "next/link";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-os-border bg-os-bg/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 md:px-8">
        <Link href="/" className="font-display text-xl font-bold tracking-[-0.02em]" aria-label="FounderOS home">
          <span className="text-os-text">Founder</span>
          <span className="text-os-indigo">OS</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden min-h-12 items-center rounded-os-md px-4 font-display text-os-sm font-medium text-os-sub hover:text-os-text md:inline-flex">
            Log in
          </Link>
          <Link href="/signup" className="inline-flex min-h-12 items-center justify-center rounded-os-md bg-os-indigo px-4 font-display text-os-sm font-medium text-white hover:bg-os-indigo/90 md:min-h-10">
            Create opportunity
          </Link>
        </div>
      </nav>
    </header>
  );
}
