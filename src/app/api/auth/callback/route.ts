import { NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login?error=auth_callback_failed", requestUrl.origin));
  }

  let error: unknown = null;

  try {
    const supabase = createSupabaseServerClient();
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } catch (callbackError) {
    error = callbackError;
  }

  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth_callback_failed", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
