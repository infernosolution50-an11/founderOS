"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signInWithEmail, signInWithMagicLink } from "@/lib/auth/actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [magicError, setMagicError] = useState("");
  const [magicSentTo, setMagicSentTo] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isMagicPending, startMagicTransition] = useTransition();

  useEffect(() => {
    if (searchParams.get("error") === "auth_callback_failed") {
      setError("We could not complete that auth link. Request a fresh link and try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await signInWithEmail(email, password);
      if (result?.error) setError(result.error);
    });
  }

  function sendMagicLink() {
    setMagicError("");
    startMagicTransition(async () => {
      const result = await signInWithMagicLink(email);
      if (result?.error) {
        setMagicError(result.error);
        return;
      }
      setMagicSentTo(result?.email ?? email);
      setSeconds(30);
    });
  }

  if (magicSentTo) {
    return (
      <div className="grid gap-5 text-center">
        <div className="rounded-os-md border border-os-border bg-os-panel p-5">
          <h2 className="font-display text-lg font-semibold text-os-text">Check your email.</h2>
          <p className="mt-2 text-sm leading-6 text-os-sub">We sent a sign-in link to {magicSentTo}.</p>
        </div>
        <Button type="button" variant="secondary" size="lg" disabled={seconds > 0 || isMagicPending} loading={isMagicPending} onClick={sendMagicLink}>
          {seconds > 0 ? `Resend link in ${seconds}s` : "Resend link"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => setMagicSentTo("")}>
          Use password instead
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={submit} className="grid gap-5">
        <Input required label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
        <div>
          <Input required label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-os-sm font-medium text-os-indigo hover:text-os-text">
              Forgot password?
            </Link>
          </div>
        </div>
        {error && <p className="text-os-sm text-os-red">{error}</p>}
        <Button type="submit" variant="primary" size="lg" loading={isPending} className="w-full">
          Log in
        </Button>
      </form>

      <div className="border-t border-os-border pt-5">
        <Button type="button" variant="secondary" size="lg" loading={isMagicPending} disabled={!email || isMagicPending} onClick={sendMagicLink} className="w-full">
          Email me a magic link
        </Button>
        {magicError && <p className="mt-2 text-os-sm text-os-red">{magicError}</p>}
      </div>

      <p className="text-center text-os-sm text-os-sub">
        No account yet?{" "}
        <Link className="font-medium text-os-indigo hover:text-os-text" href="/signup">
          Sign up
        </Link>
      </p>
    </div>
  );
}
