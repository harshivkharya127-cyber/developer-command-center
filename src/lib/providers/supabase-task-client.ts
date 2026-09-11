"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { BaseSupabaseTaskProvider } from "@/lib/providers/task-supabase-base";

/** Client-side Supabase task provider (safe to import from client components). */
export class BrowserSupabaseTaskProvider extends BaseSupabaseTaskProvider {
  protected getClient() {
    return Promise.resolve(getSupabaseBrowserClient());
  }
}
