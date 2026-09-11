import { ComposedProvider } from "@/lib/providers/composed-provider";
import { ServerSupabaseTaskProvider } from "@/lib/providers/supabase-task-server";
import { githubProvider } from "@/lib/data-provider";

/**
 * Provider for server components. Tasks + identity via the cookies-wired
 * Supabase server client when configured; GitHub surfaces fall back to the
 * shared (mock) GitHub provider until Phase 5.
 */
export const serverDataProvider = new ComposedProvider(
  githubProvider, // shared GitHub provider (mock for now)
  new ServerSupabaseTaskProvider()
);

