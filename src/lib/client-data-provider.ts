"use client";

import { ComposedProvider } from "@/lib/providers/composed-provider";
import { BrowserSupabaseTaskProvider } from "@/lib/providers/supabase-task-client";
import { githubProvider } from "@/lib/data-provider";

/**
 * Provider for client components (e.g. the interactive task list).
 * Tasks + identity via the browser Supabase client when configured;
 * GitHub surfaces fall back to the shared (mock) GitHub provider.
 */
export const clientDataProvider = new ComposedProvider(
  githubProvider, // shared GitHub provider (mock for now)
  new BrowserSupabaseTaskProvider()
);

