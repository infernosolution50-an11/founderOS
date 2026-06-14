"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/toast";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = useSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      toast.error("Supabase is not configured. Add your public Supabase env vars and redeploy.");
      return;
    }

    setLoading(true);

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
          });

    setLoading(false);

    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    toast.success(mode === "login" ? "Welcome back." : "Account created. Check your inbox if confirmation is enabled.");
    router.push("/dashboard");
    router.refresh();
  }

  async function sendMagicLink() {
    if (!supabase) {
      toast.error("Supabase is not configured. Add your public Supabase env vars and redeploy.");
      return;
    }

    setMagicLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    setMagicLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Magic link sent.");
  }

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-os-bg px-6 py-10 text-os-text">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 rounded-[2rem] border border-os-border bg-os-surface/80 p-6 shadow-glow backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <section className="flex flex-col justify-between rounded-[1.5rem] border border-os-border bg-os-panel p-8">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.4em] text-os-indigo">FounderOS</p>
              <h1 className="mt-5 font-display text-4xl font-bold text-os-text md:text-5xl">
                Research sharper. Execute faster.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-os-sub">
                A dark thinking whiteboard and Ember-powered co-founder for founders turning raw opportunities into traction.
              </p>
            </div>
            <div className="mt-12 grid gap-3 text-sm text-os-sub">
              <span className="rounded-full border border-os-border px-4 py-3">Ember keeps the feedback brutally specific.</span>
              <span className="rounded-full border border-os-border px-4 py-3">Supabase-backed research, tasks, notes, and documents.</span>
            </div>
          </section>

          <form onSubmit={submit} className="rounded-[1.5rem] border border-os-border bg-os-bg p-8">
            <h2 className="font-display text-2xl font-semibold">{isLogin ? "Log in" : "Create account"}</h2>
            <p className="mt-2 text-sm text-os-sub">
              {isLogin ? "Get back to your opportunity board." : "Start building your founder intelligence workspace."}
            </p>

            <div className="mt-8 grid gap-5">
              {!isLogin && (
                <Input label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ada Lovelace" />
              )}

              <Input required label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />

              <Input
                required
                label="Password"
                minLength={6}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !supabase}
              loading={loading}
              className="mt-8 w-full"
            >
              {isLogin ? "Log in" : "Create account"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={!email || magicLoading || !supabase}
              onClick={sendMagicLink}
              loading={magicLoading}
              className="mt-3 w-full"
            >
              Email me a magic link
            </Button>

            <p className="mt-6 text-center text-sm text-os-sub">
              {isLogin ? "No account yet?" : "Already have an account?"}{" "}
              <Link className="font-semibold text-os-indigo" href={isLogin ? "/signup" : "/login"}>
                {isLogin ? "Sign up" : "Log in"}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
