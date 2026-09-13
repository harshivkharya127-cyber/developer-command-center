"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { GithubMark } from "@/components/github-mark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signInWithGitHub, signOut, useSession } from "@/lib/auth";

/** Header widget: GitHub sign-in button when signed out, avatar menu when signed in. */
export function AuthButton() {
  const { session, ready } = useSession();
  const router = useRouter();

  if (!ready) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (!session) {
    return (
      <Button onClick={() => signInWithGitHub()} size="sm">
        <GithubMark className="h-4 w-4" />
        Sign in with GitHub
      </Button>
    );
  }

  const user = session.user;
  const meta = user.user_metadata as {
    avatar_url?: string;
    user_name?: string;
    name?: string;
    full_name?: string;
  };
  const displayName = meta.name ?? meta.full_name ?? meta.user_name ?? user.email ?? "Signed in";
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label="Account menu" className="rounded-full outline-none">
          <Avatar className="h-8 w-8">
            {meta.avatar_url ? <AvatarImage src={meta.avatar_url} alt={displayName} /> : null}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">@{meta.user_name ?? "github"}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
