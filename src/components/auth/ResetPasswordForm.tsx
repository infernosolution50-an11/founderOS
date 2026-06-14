"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrength, passwordRules } from "@/components/auth/PasswordStrength";
import { updatePassword } from "@/lib/auth/actions";

export function ResetPasswordForm({ valid }: { valid: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rules = passwordRules(password);
  const validPassword = rules.length && rules.uppercase && rules.number;

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => router.push("/dashboard"), 2000);
    return () => window.clearTimeout(timer);
  }, [router, success]);

  if (!valid) {
    return (
      <div className="grid gap-5 text-center">
        <div className="rounded-os-md border border-os-border bg-os-panel p-5">
          <h2 className="font-display text-lg font-semibold text-os-text">This reset link has expired.</h2>
          <p className="mt-2 text-sm leading-6 text-os-sub">Request a new one and use the latest email from FounderOS.</p>
        </div>
        <Link href="/forgot-password" className="text-os-sm font-medium text-os-indigo hover:text-os-text">
          Request a new one
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-os-md border border-os-border bg-os-panel p-5 text-center">
        <h2 className="font-display text-lg font-semibold text-os-text">Password updated.</h2>
        <p className="mt-2 text-sm leading-6 text-os-sub">You&apos;re now logged in. Redirecting to your dashboard...</p>
      </div>
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!validPassword) {
      setError("Use at least 8 characters, one uppercase letter, and one number.");
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(password);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div>
        <Input required label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
        <PasswordStrength password={password} />
      </div>
      {error && <p className="text-os-sm text-os-red">{error}</p>}
      <Button type="submit" variant="primary" size="lg" loading={isPending} className="w-full">
        Update password
      </Button>
    </form>
  );
}
