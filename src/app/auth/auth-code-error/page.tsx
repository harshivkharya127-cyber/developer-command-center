import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-xl font-semibold">Sign-in failed</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        We could not complete the GitHub sign-in. The auth code may have expired or was already
        used. Please try signing in again.
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
