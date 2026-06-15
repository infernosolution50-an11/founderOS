import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    checks: {
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabasePublicKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY)
    }
  });
}

