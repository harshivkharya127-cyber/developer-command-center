import { GitCommitHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { relativeTime } from "@/lib/date-utils";
import type { Commit, Issue, PullRequest } from "@/lib/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CommitList({ commits }: { commits: Commit[] }) {
  return (
    <ul className="divide-y">
      {commits.map((commit) => (
        <li key={commit.sha} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <GitCommitHorizontal className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <a
              href={commit.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-2 text-sm font-medium hover:underline"
            >
              {commit.message}
            </a>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <span className="font-mono">{commit.sha.slice(0, 7)}</span> · {commit.repo} ·{" "}
              {relativeTime(commit.date)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

const PR_STATE_STYLES: Record<PullRequest["state"], string> = {
  open: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  draft: "bg-muted text-muted-foreground",
  merged: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  closed: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function PullRequestList({ pullRequests }: { pullRequests: PullRequest[] }) {
  return (
    <ul className="divide-y">
      {pullRequests.map((pr) => (
        <li key={pr.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <Avatar className="mt-0.5 h-6 w-6">
            {pr.authorAvatarUrl ? <AvatarImage src={pr.authorAvatarUrl} alt={pr.author} /> : null}
            <AvatarFallback className="text-[10px]">{initials(pr.author)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <a
              href={pr.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-2 text-sm font-medium hover:underline"
            >
              {pr.title}
            </a>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {pr.repo} #{pr.number} · opened {relativeTime(pr.createdAt)}
              {typeof pr.additions === "number" && typeof pr.deletions === "number" ? (
                <span className="ml-2 font-mono">
                  <span className="text-emerald-600 dark:text-emerald-400">+{pr.additions}</span>{" "}
                  <span className="text-red-600 dark:text-red-400">−{pr.deletions}</span>
                </span>
              ) : null}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${PR_STATE_STYLES[pr.state]}`}
          >
            {pr.state}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function IssueList({ issues }: { issues: Issue[] }) {
  return (
    <ul className="divide-y">
      {issues.map((issue) => (
        <li key={issue.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <Avatar className="mt-0.5 h-6 w-6">
            {issue.authorAvatarUrl ? <AvatarImage src={issue.authorAvatarUrl} alt={issue.author} /> : null}
            <AvatarFallback className="text-[10px]">{initials(issue.author)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <a
              href={issue.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-2 text-sm font-medium hover:underline"
            >
              {issue.title}
            </a>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {issue.repo} #{issue.number} · opened {relativeTime(issue.createdAt)}
            </p>
            {issue.labels.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {issue.labels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
