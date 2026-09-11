import { getSupabaseServerClient } from "@/lib/supabase/server";
import { BaseSupabaseTaskProvider } from "@/lib/providers/task-supabase-base";

/** Server-side Supabase task provider (uses next/headers; server-only). */
export class ServerSupabaseTaskProvider extends BaseSupabaseTaskProvider {
  protected getClient() {
    return getSupabaseServerClient();
  }
}
