import Link from "next/link";

export function CtaSection() {
  return (
    <section className="border-t border-os-border px-5 py-20 text-center">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display text-[26px] font-bold text-os-text md:text-[32px]">Your idea deserves a proper analysis.</h2>
        <p className="mt-3 text-base leading-7 text-os-sub">Most people with a business idea never act on it. FounderOS changes that.</p>
        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 md:max-w-none md:flex-row md:justify-center">
          <Link href="/signup" className="inline-flex min-h-12 w-full items-center justify-center rounded-os-md bg-os-indigo px-5 font-display text-sm font-medium text-white hover:bg-os-indigo/90 md:w-auto">
            Create your first opportunity
          </Link>
          <Link href="/dashboard?example=true" className="inline-flex min-h-12 w-full items-center justify-center rounded-os-md border border-os-border px-5 font-display text-sm font-medium text-os-text hover:border-os-border-strong hover:bg-os-panel md:w-auto">
            Start with an example
          </Link>
        </div>
        <p className="mt-4 text-os-xs text-os-muted">Free to start. No credit card.</p>
      </div>
    </section>
  );
}
