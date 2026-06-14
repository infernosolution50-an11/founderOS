import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-os-border px-4 py-5 md:px-8">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-4 text-os-xs text-os-muted md:flex-row md:items-center md:justify-between">
        <Link href="/" className="font-display text-sm font-bold" aria-label="FounderOS home">
          <span className="text-os-text">Founder</span>
          <span className="text-os-indigo">OS</span>
        </Link>
        <nav className="flex gap-5">
          <Link href="/privacy" className="hover:text-os-text">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-os-text">
            Terms
          </Link>
          <Link href="/login" className="hover:text-os-text">
            Log in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
