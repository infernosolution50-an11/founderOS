import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { error: profileError } = await supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email ?? "",
      full_name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
      plan: "free"
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("Failed to ensure FounderOS profile", profileError);
    return {
      supabase,
      user,
      response: NextResponse.json({ error: "Unable to initialize your FounderOS profile." }, { status: 500 })
    };
  }

  return { supabase, user, response: null };
}
