"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, createSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type AuthActionResult = {
  error?: string;
  email?: string;
};

function appOrigin() {
  const headerStore = headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function friendlyAuthError(message?: string) {
  const text = message || "Authentication failed. Check your details and try again.";
  if (text.toLowerCase().includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }
  if (text.toLowerCase().includes("already registered") || text.toLowerCase().includes("already exists")) {
    return "This email is already registered. Log in instead?";
  }
  return text;
}

export async function signUpWithEmail(email: string, password: string, fullName: string): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured. Add the public Supabase environment variables and redeploy." };
  }

  const supabase = createSupabaseServerClient();
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${appOrigin()}/api/auth/callback?next=/dashboard`
    }
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  if (data.user?.id) {
    try {
      const service = createSupabaseServiceClient();
      const { error: profileError } = await service.from("users").upsert({
        id: data.user.id,
        email: normalizedEmail,
        full_name: fullName,
        plan: "free",
        created_at: new Date().toISOString()
      });

      if (profileError) {
        return { error: "Account created, but the FounderOS profile could not be initialized. Contact support before continuing." };
      }
    } catch {
      return { error: "Account created, but the FounderOS profile could not be initialized. Contact support before continuing." };
    }
  }

  revalidatePath("/signup");
  return { email: normalizedEmail };
}

export async function resendSignupConfirmation(email: string): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured. Add the public Supabase environment variables and redeploy." };
  }

  const supabase = createSupabaseServerClient();
  const normalizedEmail = email.trim().toLowerCase();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: normalizedEmail,
    options: {
      emailRedirectTo: `${appOrigin()}/api/auth/callback?next=/dashboard`
    }
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  revalidatePath("/signup");
  return { email: normalizedEmail };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured. Add the public Supabase environment variables and redeploy." };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function signInWithMagicLink(email: string): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured. Add the public Supabase environment variables and redeploy." };
  }

  const supabase = createSupabaseServerClient();
  const normalizedEmail = email.trim().toLowerCase();
  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: `${appOrigin()}/api/auth/callback?next=/dashboard`
    }
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  revalidatePath("/login");
  return { email: normalizedEmail };
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function sendPasswordReset(email: string): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured. Add the public Supabase environment variables and redeploy." };
  }

  const supabase = createSupabaseServerClient();
  const normalizedEmail = email.trim().toLowerCase();
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${appOrigin()}/reset-password`
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  revalidatePath("/forgot-password");
  return { email: normalizedEmail };
}

export async function updatePassword(newPassword: string): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured. Add the public Supabase environment variables and redeploy." };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  revalidatePath("/dashboard");
  return {};
}
