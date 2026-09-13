"use client";

import { GithubMark } from "@/components/github-mark";
import { Button } from "@/components/ui/button";
import { signInWithGitHub } from "@/lib/auth";

/** Full-size GitHub sign-in call-to-action (used on pages that need auth). */
export function SignInButton() {
  return (
    <Button onClick={() => signInWithGitHub()} size="sm">
      <GithubMark className="h-4 w-4" />
      Sign in with GitHub
    </Button>
  );
}