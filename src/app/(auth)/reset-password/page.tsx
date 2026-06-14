import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ResetPasswordPageProps = {
  searchParams: {
    code?: string;
    type?: string;
  };
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  let valid = false;

  if (isSupabaseConfigured() && searchParams.code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code);
    valid = !error;
  }

  return (
    <AuthShell title="Create a new password" subtitle="Choose a strong password to get back into FounderOS.">
      <ResetPasswordForm valid={valid} />
    </AuthShell>
  );
}
