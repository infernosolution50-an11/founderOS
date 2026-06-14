"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { sendPasswordReset } from "@/lib/auth/actions";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await sendPasswordReset(email);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="grid gap-5 text-center">
        <div className="rounded-os-md border border-os-border bg-os-panel p-5">
          <p className="text-sm leading-6 text-os-sub">If that email is registered, we&apos;ve sent a password reset link. Check your inbox.</p>
        </div>
        <Link href="/login" className="text-os-sm font-medium text-os-indigo hover:text-os-text">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <Input required label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
      {error && <p className="text-os-sm text-os-red">{error}</p>}
      <Button type="submit" variant="primary" size="lg" loading={isPending} className="w-full">
        Send reset link
      </Button>
      <Link href="/login" className="text-center text-os-sm font-medium text-os-indigo hover:text-os-text">
        Back to log in
      </Link>
    </form>
  );
}
