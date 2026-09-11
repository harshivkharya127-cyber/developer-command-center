import "server-only";

import { computeStreaks } from "@/lib/contribution-utils";
import { getGitHubAuth, githubFetch, githubGraphQL, type GitHubAuth } from "@/lib/github";
import { MockDataProvider, type CurrentUser, type DataProvider } from "@/lib/data-provider";
import type {
  Commit,
  Contributions,
  Issue,
  PullRequest,
  RepoCard,
  Task,
} from "@/lib/types";

// ---- Raw GitHub API shapes (subset) ----------------------------------------

interface ApiRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  open_issues_count: number;
  pushed_at: string;
  updated_at: string;
  html_url: string;
}

interface ApiEvent {
  type: string;
  repo: { name: string };
  created_at: string;
  payload?: {
    commits?: { sha: string; message: string }[];
  };
}

interface ApiSearchPR {
  id: number;
  title: string;
  number: number;
  state: string;
  draft?: boolean;
  created_at: string;
  updated_at: string;
  html_url: string;
  repository_url: string;
  user: { login: string; avatar_url: string } | null;
}

interface ApiIssue {
  id: number;
  title: string;
  number: number;
  state: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  labels: { name: string }[];
  repository_url: string;
  user: { login: string; avatar_url: string } | null;
  pull_request?: unknown; // present when the "issue" is actually a PR — filtered out
}

interface ContributionCalendar {
  viewer: {
    login: string;
    name: string | null;
    avatarUrl: string;
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: {
          contributionDays: { date: string; contributionCount: number }[];
        }[];
      };
    };
  };
}

// ---- Mappers ----------------------------------------------------------------

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Go: "#00ADD8",
  Python: "#3572A5",
  Rust: "#dea584",
  HCL: "#844FBA",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
};

function repoFromUrl(repositoryUrl: string): string {
  // https://api.github.com/repos/{owner}/{repo}/...
  const parts = repositoryUrl.split("/");
  return parts.slice(-2).join("/");
}

/**
 * Server-side GitHub API provider. Construct via `GitHubApiProvider.create()`
 * so token-less visitors degrade to the mock provider automatically.
 */
export class GitHubApiProvider implements DataProvider {
  private constructor(private auth: GitHubAuth) {}

  static async create(): Promise<DataProvider> {
    const auth = await getGitHubAuth().catch(() => null);
    return auth ? new GitHubApiProvider(auth) : new MockDataProvider();
  }

  async getCurrentUser(): Promise<CurrentUser | null> {
    const { login } = this.auth;
    const user = await githubFetch<{ name: string | null; avatar_url: string }>(
      `/users/${login}`,
      this.auth.token
    );
    if (!user) return null;
    return { id: login, login, name: user.name ?? login, avatarUrl: user.avatar_url };
  }

  async getRepos(): Promise<RepoCard[]> {
    const repos = await githubFetch<ApiRepo[]>(
      "/user/repos?sort=pushed&per_page=20&affiliation=owner,collaborator",
      this.auth.token
    );
    if (!repos) return [];
    return repos.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      language: r.language,
      languageColor: r.language ? (LANG_COLORS[r.language] ?? null) : null,
      stars: r.stargazers_count,
      forks: r.forks_count,
      isPrivate: r.private,
      openIssues: r.open_issues_count,
      openPRs: null, // per-repo PR counts require extra calls; full list is on the PR page
      updatedAt: r.pushed_at ?? r.updated_at,
      htmlUrl: r.html_url,
    }));
  }

  async getRecentCommits(limit = 10): Promise<Commit[]> {
    const events = await githubFetch<ApiEvent[]>(
      `/users/${this.auth.login}/events/public?per_page=30`,
      this.auth.token
    );
    if (!events) return [];
    const commits: Commit[] = [];
    for (const event of events) {
      if (event.type !== "PushEvent" || !event.payload?.commits) continue;
      for (const c of event.payload.commits) {
        commits.push({
          sha: c.sha,
          message: c.message.split("\n")[0],
          authorName: this.auth.login,
          authorAvatarUrl: null,
          repo: event.repo.name,
          date: event.created_at,
          htmlUrl: `https://github.com/${event.repo.name}/commit/${c.sha}`,
        });
        if (commits.length >= limit) return commits;
      }
    }
    return commits;
  }

  async getOpenPullRequests(): Promise<PullRequest[]> {
    const result = await githubFetch<{ items: ApiSearchPR[] }>(
      `/search/issues?q=type%3Apr+author%3A${this.auth.login}+state%3Aopen&sort=updated&per_page=15`,
      this.auth.token
    );
    if (!result?.items) return [];
    return result.items.map((pr) => ({
      id: pr.id,
      title: pr.title,
      repo: repoFromUrl(pr.repository_url),
      number: pr.number,
      author: pr.user?.login ?? "unknown",
      authorAvatarUrl: pr.user?.avatar_url ?? null,
      state: pr.draft ? "draft" : "open",
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      additions: null,
      deletions: null,
      htmlUrl: pr.html_url,
    }));
  }

  async getOpenIssues(): Promise<Issue[]> {
    const issues = await githubFetch<ApiIssue[]>(
      "/user/issues?state=open&sort=updated&per_page=15",
      this.auth.token
    );
    if (!issues) return [];
    return issues
      .filter((i) => !i.pull_request) // /user/issues mixes in PRs
      .map((issue) => ({
        id: issue.id,
        title: issue.title,
        repo: repoFromUrl(issue.repository_url),
        number: issue.number,
        author: issue.user?.login ?? "unknown",
        authorAvatarUrl: issue.user?.avatar_url ?? null,
        state: issue.state === "closed" ? "closed" : "open",
        labels: issue.labels.map((l) => l.name),
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        htmlUrl: issue.html_url,
      }));
  }

  async getContributions(): Promise<Contributions> {
    const data = await githubGraphQL<ContributionCalendar>(
      `query {
        viewer {
          login
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }`,
      this.auth.token
    );
    if (!data) {
      return { total: 0, byDay: [], longestStreak: 0, currentStreak: 0 };
    }
    const byDay = data.viewer.contributionsCollection.contributionCalendar.weeks
      .flatMap((w) => w.contributionDays)
      .map((d) => ({ date: d.date, count: d.contributionCount }));
    const total = data.viewer.contributionsCollection.contributionCalendar.totalContributions;
    return { total, byDay, ...computeStreaks(byDay) };
  }

  // Tasks come from the Supabase provider — never GitHub.
  async getTasks(): Promise<Task[]> {
    return [];
  }
  async createTask(): Promise<Task> {
    throw new Error("Tasks are stored in Supabase, not GitHub");
  }
  async updateTask(): Promise<Task> {
    throw new Error("Tasks are stored in Supabase, not GitHub");
  }
  async deleteTask(): Promise<void> {
    throw new Error("Tasks are stored in Supabase, not GitHub");
  }
}
