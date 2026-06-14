import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-os-bg text-os-text">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-os-border bg-os-surface p-5 lg:block">
        <Link href="/dashboard" className="font-display text-2xl font-bold text-os-indigo">
          FounderOS
        </Link>
        <nav className="mt-8 grid gap-2 text-sm text-os-sub">
          <Link className="rounded-xl border border-os-border px-4 py-3 hover:text-os-text" href="/dashboard">
            Opportunities
          </Link>
          <span className="rounded-xl border border-os-border px-4 py-3 text-os-muted">Ember Intelligence</span>
        </nav>
        <p className="absolute bottom-5 left-5 right-5 text-xs leading-5 text-os-muted">{user.email}</p>
      </aside>
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
