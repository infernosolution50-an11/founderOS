import Link from "next/link";

export function HeroSection() {
  return (
    <section className="px-4 pb-14 pt-16 text-center md:px-8 md:pb-20 md:pt-24">
      <div className="mx-auto max-w-[1100px]">
        <div className="mx-auto inline-flex rounded-full border border-os-indigo-dim bg-os-indigo/10 px-4 py-2 font-display text-os-xs font-medium uppercase tracking-[0.18em] text-os-indigo">
          Founder intelligence platform
        </div>
        <h1 className="mx-auto mt-6 max-w-4xl font-display text-[36px] font-bold leading-[1.08] tracking-[-0.02em] text-os-text md:text-[56px]">
          Research sharper. <span className="text-os-indigo">Execute faster.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[480px] text-base leading-7 text-os-sub md:text-lg">
          A dark thinking whiteboard and Ember-powered co-founder that turns raw business ideas into scored, structured, executable opportunities.
        </p>
        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 md:max-w-none md:flex-row md:justify-center">
          <Link href="/signup" className="inline-flex min-h-12 w-full items-center justify-center rounded-os-md bg-os-indigo px-5 font-display text-sm font-medium text-white hover:bg-os-indigo/90 md:w-auto">
            Start building — it&apos;s free
          </Link>
          <Link href="/dashboard?example=true" className="inline-flex min-h-12 w-full items-center justify-center rounded-os-md border border-os-border px-5 font-display text-sm font-medium text-os-text hover:border-os-border-strong hover:bg-os-panel md:w-auto">
            See an example opportunity
          </Link>
        </div>
        <p className="mt-4 text-os-xs text-os-muted">Free to start. No credit card.</p>
      </div>
    </section>
  );
}
