"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrength, passwordRules } from "@/components/auth/PasswordStrength";
import { resendSignupConfirmation, signUpWithEmail } from "@/lib/auth/actions";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [isPending, startTransition] = useTransition();
  const rules = passwordRules(password);
  const validPassword = rules.length && rules.uppercase && rules.number;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!validPassword) {
      setError("Use at least 8 characters, one uppercase letter, and one number.");
      return;
    }

    startTransition(async () => {
      const result = await signUpWithEmail(email, password, fullName);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSentTo(result?.email ?? email);
    });
  }

  if (sentTo) {
    return (
      <div className="grid gap-5 text-center">
        <div className="rounded-os-md border border-os-border bg-os-panel p-5">
          <h2 className="font-display text-lg font-semibold text-os-text">Confirm your email.</h2>
          <p className="mt-2 text-sm leading-6 text-os-sub">
            We sent a verification link to {sentTo}. Click it to activate your account.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          loading={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await resendSignupConfirmation(sentTo);
              if (result?.error) setError(result.error);
            })
          }
        >
          Resend email
        </Button>
        {error && <p className="text-os-sm text-os-red">{error}</p>}
        <Button type="button" variant="ghost" size="lg" onClick={() => setSentTo("")}>
          Wrong email? Go back
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <Input required label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ada Lovelace" />
      <Input required label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
      <div>
        <Input required label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
        <PasswordStrength password={password} />
      </div>
      {error && (
        <p className="text-os-sm text-os-red">
          {error.includes("already registered") ? (
            <>
              This email is already registered.{" "}
              <Link className="text-os-indigo hover:text-os-text" href="/login">
                Log in instead?
              </Link>
            </>
          ) : (
            error
          )}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" loading={isPending} className="w-full">
        Create my account
      </Button>
      <p className="text-center text-os-sm text-os-sub">
        Already have an account?{" "}
        <Link className="font-medium text-os-indigo hover:text-os-text" href="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
