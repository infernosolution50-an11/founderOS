import { CheckCircle2, LogOut, XCircle } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function StatusRow({ label, configured }: { label: string; configured: boolean }) {
  const Icon = configured ? CheckCircle2 : XCircle;
  return (
    <div className="flex items-center justify-between gap-3 rounded-os-md border border-os-border bg-os-panel p-3">
      <span className="text-os-sm text-os-text">{label}</span>
      <Badge tone={configured ? "green" : "red"} className="gap-2">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {configured ? "Configured" : "Missing"}
      </Badge>
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const fullName = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "Founder";

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl">
        <p className="font-display text-os-xs font-semibold uppercase tracking-[0.24em] text-os-indigo">Workspace</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-os-text">Settings</h1>
        <p className="mt-2 text-os-sm text-os-sub">Manage your profile, deployment configuration, and session.</p>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-4 p-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-os-text">Profile</h2>
              <p className="text-os-sm text-os-sub">Account details from Supabase Auth.</p>
            </div>
            <div className="rounded-os-md border border-os-border bg-os-panel p-4">
              <p className="font-display text-lg font-semibold text-os-text">{fullName}</p>
              <p className="mt-1 text-os-sm text-os-sub">{user?.email}</p>
              <Badge className="mt-3">Free plan</Badge>
            </div>
            <form action={signOut}>
              <Button type="submit" variant="destructive" size="lg" leftIcon={<LogOut className="h-4 w-4" aria-hidden="true" />}>
                Sign out
              </Button>
            </form>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-os-text">Runtime Health</h2>
              <p className="text-os-sm text-os-sub">Safe configuration checks for production readiness.</p>
            </div>
            <StatusRow label="Supabase URL" configured={Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)} />
            <StatusRow
              label="Supabase public key"
              configured={Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)}
            />
            <StatusRow label="Supabase service role" configured={Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)} />
            <StatusRow label="OpenAI API key" configured={Boolean(process.env.OPENAI_API_KEY)} />
          </Card>
        </div>
      </div>
    </main>
  );
}

