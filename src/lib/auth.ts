"use client";

import type { Session } from "@supabase/supabase-js";
import * as React from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** Reactive auth session state for client components. Null when unconfigured/unauthenticated. */
export function useSession(): { session: Session | null; ready: boolean } {
  const [session, setSession] = React.useState<Session | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setReady(true);
      return;
    }
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

  return { session, ready };
}

const GITHUB_SCOPES = "read:user user:email repo";

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

export async function signOut(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.auth.signOut();
  window.location.href = "/";
}
