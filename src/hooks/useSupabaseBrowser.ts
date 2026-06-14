"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function useSupabaseBrowserClient() {
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    try {
      setClient(createSupabaseBrowserClient());
    } catch {
      setClient(null);
    }
  }, []);

  return client;
}
