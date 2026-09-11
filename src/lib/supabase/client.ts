import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

/** Lazily create the singleton browser Supabase client. Returns null when env is missing. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const env = getPublicEnv();
  if (!env) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(env.url, env.anonKey);
  }
  return browserClient;
}
