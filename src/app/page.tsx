import { GitCommitHorizontal, GitFork, GitPullRequest, ListTodo, Star } from "lucide-react";

import { ContributionSection } from "@/components/contribution";
import { CommitList, IssueList, PullRequestList } from "@/components/feeds";
import { RepositoryGrid } from "@/components/repository";
import { EmptyState, ErrorState } from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerDataProvider } from "@/lib/server-data-provider";
import type { DataProvider } from "@/lib/data-provider";
import { compactNumber } from "@/lib/date-utils";
import { countByStatus, isOverdue } from "@/lib/task-utils";

async function loadDashboard(provider: DataProvider) {
  const [user, repos, commits, pullRequests, issues, contributions, tasks] =
    await Promise.all([
      provider.getCurrentUser(),
      provider.getRepos(),
      provider.getRecentCommits(5),
      provider.getOpenPullRequests(),
      provider.getOpenIssues(),
      provider.getContributions(),
      provider.getTasks(),
    ]);
  return { user, repos, commits, pullRequests, issues, contributions, tasks };
}

export default async function DashboardPage() {
  let data: Awaited<ReturnType<typeof loadDashboard>>;
  try {
    const provider = await getServerDataProvider();
    data = await loadDashboard(provider);
  } catch (err) {
    return (
      <ErrorState
        message={err instanceof Error ? err.message : "Failed to load dashboard data."}
      />
    );
  }

  const { user, repos, commits, pullRequests, issues, contributions, tasks } = data;
  const statusCounts = countByStatus(tasks);
  const overdueCount = tasks.filter((t) => isOverdue(t)).length;
  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks, 0);

  const stats = [
    { label: "Repositories", value: String(repos.length), icon: GitFork },
    { label: "Stars earned", value: compactNumber(totalStars), icon: Star },
    { label: "Forks", value: compactNumber(totalForks), icon: GitFork },
    { label: "Open PRs", value: String(pullRequests.length), icon: GitPullRequest },
    { label: "Open issues", value: String(issues.length), icon: GitCommitHorizontal },
    {
      label: "Tasks due",
      value: `${statusCounts.todo + statusCounts.in_progress}${overdueCount ? ` (${overdueCount} overdue)` : ""}`,
      icon: ListTodo,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        {user ? (
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.name} (@{user.login}).
          </p>
        ) : null}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <p className="text-xs">{label}</p>
              </div>
              <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Contributions */}
      <Card>
        <CardHeader>
          <CardTitle>Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <ContributionSection contributions={contributions} />
        </CardContent>
      </Card>

      {/* Repositories */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Repositories</h2>
        {repos.length === 0 ? (
          <EmptyState
            title="No repositories found"
            description="Connect GitHub or create your first repository."
          />
        ) : (
          <RepositoryGrid repos={repos} />
        )}
      </section>

      {/* Feeds */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent commits</CardTitle>
          </CardHeader>
          <CardContent>
            {commits.length === 0 ? (
              <EmptyState title="No recent commits" />
            ) : (
              <CommitList commits={commits} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open pull requests</CardTitle>
          </CardHeader>
          <CardContent>
            {pullRequests.length === 0 ? (
              <EmptyState title="No open pull requests" />
            ) : (
              <PullRequestList pullRequests={pullRequests} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open issues</CardTitle>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <EmptyState title="No open issues" />
            ) : (
              <IssueList issues={issues} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

