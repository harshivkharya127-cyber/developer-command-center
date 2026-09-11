import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

const GITHUB_API = "https://api.github.com";

export interface GitHubAuth {
  token: string;
  login: string;
}

/**
 * Resolve a GitHub access token, strictly server-side. Preference order:
 *   1. The OAuth provider token attached to the Supabase session
 *   2. A personal-access token from the GITHUB_TOKEN env var (optional)
 * Returns null when neither is available (app falls back to mock data).
 * Never log or return the token to the client.
 */
export async function getGitHubAuth(): Promise<GitHubAuth | null> {
  let token: string | undefined;
  let login: string | undefined;

  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session?.provider_token) {
      token = session.provider_token;
      const meta = session.user.user_metadata as { user_name?: string };
      login = meta.user_name;
    }
  }

  if (!token && process.env.GITHUB_TOKEN) {
    token = process.env.GITHUB_TOKEN;
  }

  if (!token) return null;

  // Resolve the login if we don't have it from the session.
  if (!login) {
    const viewer = await githubFetch<{ login: string }>("/user", token);
    if (!viewer) return null;
    login = viewer.login;
  }

  return { token, login };
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

/** Fetch a GitHub REST endpoint with auth, timeout, and friendly errors. */
export async function githubFetch<T>(
  path: string,
  token: string,
  revalidateSeconds = 300
): Promise<T | null> {
  const res = await fetch(path.startsWith("http") ? path : `${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: revalidateSeconds },
  });

  if (res.status === 304) return null;
  if (res.status === 401) {
    throw new GitHubApiError("GitHub rejected the access token. Please sign in again.", 401);
  }
  if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
    throw new GitHubApiError(
      "GitHub API rate limit reached. Try again in a few minutes.",
      403
    );
  }
  if (!res.ok) {
    throw new GitHubApiError(`GitHub API error (${res.status}) for ${path}`, res.status);
  }
  return (await res.json()) as T;
}

/** GitHub GraphQL query (used for the contributions calendar). */
export async function githubGraphQL<T>(
  query: string,
  token: string,
  revalidateSeconds = 300
): Promise<T | null> {
  const res = await fetch(`${GITHUB_API}/graphql`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new GitHubApiError(`GitHub GraphQL error (${res.status})`, res.status);
  }
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new GitHubApiError(json.errors.map((e) => e.message).join("; "), 400);
  }
  return json.data ?? null;
}
