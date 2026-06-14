import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-os-bg px-0 text-os-text md:px-6 md:py-10">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center md:min-h-[calc(100vh-5rem)]">
        <div className="px-6 pb-6 pt-8 text-center md:px-0">
          <Link href="/" className="font-display text-2xl font-bold" aria-label="FounderOS home">
            <span className="text-os-text">Founder</span>
            <span className="text-os-indigo">OS</span>
          </Link>
          <h1 className="mt-8 font-display text-2xl font-bold text-os-text">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-os-sub">{subtitle}</p>
        </div>
        <section className="min-h-[calc(100vh-11rem)] border-os-border bg-os-surface px-6 py-6 md:min-h-0 md:rounded-2xl md:border md:p-9">
          {children}
        </section>
      </div>
    </main>
  );
}
