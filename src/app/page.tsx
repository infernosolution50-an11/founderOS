import { redirect } from "next/navigation";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard" : "/login");
}
