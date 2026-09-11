import { ComposedProvider } from "@/lib/providers/composed-provider";
import { ServerSupabaseTaskProvider } from "@/lib/providers/supabase-task-server";
import { GitHubApiProvider } from "@/lib/providers/github-api-provider";
import { githubProvider, MockDataProvider, type DataProvider } from "@/lib/data-provider";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Provider for server components. The GitHub surface is request-scoped: when a
 * signed-in user (or GITHUB_TOKEN) supplies an access token we use the live
 * GitHub API provider, otherwise the mock provider. Tasks + identity come from
 * Supabase when configured, mock otherwise.
 */
export async function getServerDataProvider(): Promise<DataProvider> {
  const [github, mock] = await Promise.all([
    GitHubApiProvider.create(),
    Promise.resolve(supabaseConfigured ? null : new MockDataProvider()),
  ]);

  return new ComposedProvider(
    github ?? githubProvider,
    supabaseConfigured ? new ServerSupabaseTaskProvider() : mock!
  );
}

