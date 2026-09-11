/**
 * Public (NEXT_PUBLIC_) Supabase env vars. These are safe for the browser:
 * the anon key is a public identifier and all privilege comes from the
 * authenticated session + Row Level Security. Never put service keys here.
 */
export function getPublicEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}
