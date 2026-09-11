import { ArrowUpDown } from "lucide-react";

import { EmptyState, ErrorState } from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerDataProvider } from "@/lib/server-data-provider";
import type { Commit, Issue, PullRequest } from "@/lib/types";
import { CommitList, IssueList, PullRequestList } from "@/components/feeds";

export async function ListPage({
  title,
  kind,
}: {
  title: string;
  kind: "commits" | "pull-requests" | "issues";
}) {
  let data: Commit[] | PullRequest[] | Issue[];
  try {
    const provider = await getServerDataProvider();
    data =
      kind === "commits"
        ? await provider.getRecentCommits(30)
        : kind === "pull-requests"
          ? await provider.getOpenPullRequests()
          : await provider.getOpenIssues();
  } catch (err) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <ErrorState message={err instanceof Error ? err.message : "Failed to load data."} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            {data.length} item{data.length === 1 ? "" : "s"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <EmptyState
              title={`No ${kind.replace("-", " ")} to show`}
              description="When there is activity, it will appear here."
            />
          ) : kind === "commits" ? (
            <CommitList commits={data as Commit[]} />
          ) : kind === "pull-requests" ? (
            <PullRequestList pullRequests={data as PullRequest[]} />
          ) : (
            <IssueList issues={data as Issue[]} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
