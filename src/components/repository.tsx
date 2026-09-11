import { ArrowDownRight, ArrowUpRight, GitFork, Lock, Star } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { relativeTime } from "@/lib/date-utils";
import type { RepoCard as RepoCardModel } from "@/lib/types";

export function RepositoryCard({ repo }: { repo: RepoCardModel }) {
  return (
    <Card className="flex flex-col transition-colors hover:border-foreground/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            <Link
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {repo.name}
            </Link>
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {repo.isPrivate ? (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" /> Private
              </Badge>
            ) : (
              <Badge variant="outline">Public</Badge>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2 min-h-8">
          {repo.description ?? "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {repo.language ? (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: repo.languageColor ?? "currentColor" }}
              />
              {repo.language}
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" /> {repo.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" /> {repo.forks}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-3">
          <span>{repo.openIssues} issues</span>
          {typeof repo.openPRs === "number" ? <span>{repo.openPRs} PRs</span> : null}
        </span>
        <span>Updated {relativeTime(repo.updatedAt)}</span>
      </CardFooter>
    </Card>
  );
}

export function RepositoryGrid({ repos }: { repos: RepoCardModel[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {repos.map((repo) => (
        <RepositoryCard key={repo.id} repo={repo} />
      ))}
    </div>
  );
}

export { ArrowUpRight, ArrowDownRight };
