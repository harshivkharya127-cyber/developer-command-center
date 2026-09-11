"use client";

import type { Session } from "@supabase/supabase-js";
import * as React from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Inlined at build time and identical on server and client, so this can be
// read during render without hydration-mismatch risk.
const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const GITHUB_SCOPES = "read:user user:email repo";

/** Reactive auth session state for client components. Null when unconfigured/unauthenticated. */
export function useSession(): { session: Session | null; ready: boolean } {
  const [session, setSession] = React.useState<Session | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!configured) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    // Initial session fetch + live subscription — setState only in callbacks
    // (never synchronously in the effect body).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { session, ready: ready || !configured };
}

/** Start GitHub OAuth. Requires Supabase env vars + GitHub provider enabled. */
export async function signInWithGitHub(next = "/"): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    window.alert(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to enable sign-in."
    );
    return;
  }
  await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      scopes: GITHUB_SCOPES,
    },
  });
}

/**
 * Sign out. Navigation afterwards is the caller's responsibility (e.g.
 * `router.push("/")` from an event handler) so this helper stays hook-free.
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}
