import type { Commit, RepoCard } from "./types";

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

export const MOCK_USER = {
  id: "11111111-1111-1111-1111-111111111111",
  login: "octodev",
  name: "Octo Dev",
  avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
};

export const MOCK_REPOS: RepoCard[] = [
  {
    id: 1,
    name: "api",
    fullName: "octodev/api",
    description: "REST + GraphQL API gateway for the Acme platform.",
    language: "TypeScript",
    languageColor: "#3178c6",
    stars: 214,
    forks: 31,
    isPrivate: false,
    openIssues: 8,
    openPRs: 3,
    updatedAt: hoursAgo(3),
    htmlUrl: "https://github.com/octodev/api",
  },
  {
    id: 2,
    name: "web-dashboard",
    fullName: "octodev/web-dashboard",
    description: "React dashboard for Acme customers.",
    language: "TypeScript",
    languageColor: "#3178c6",
    stars: 96,
    forks: 12,
    isPrivate: false,
    openIssues: 5,
    openPRs: 2,
    updatedAt: hoursAgo(20),
    htmlUrl: "https://github.com/octodev/web-dashboard",
  },
  {
    id: 3,
    name: "cli-tools",
    fullName: "octodev/cli-tools",
    description: "Swiss-army CLI for Acme developers.",
    language: "Go",
    languageColor: "#00ADD8",
    stars: 341,
    forks: 47,
    isPrivate: false,
    openIssues: 14,
    openPRs: 1,
    updatedAt: daysAgo(2),
    htmlUrl: "https://github.com/octodev/cli-tools",
  },
  {
    id: 4,
    name: "infra-terraform",
    fullName: "octodev/infra-terraform",
    description: "Terraform modules for Acme cloud infrastructure.",
    language: "HCL",
    languageColor: "#844FBA",
    stars: 18,
    forks: 4,
    isPrivate: true,
    openIssues: 2,
    openPRs: 0,
    updatedAt: daysAgo(6),
    htmlUrl: "https://github.com/octodev/infra-terraform",
  },
  {
    id: 5,
    name: "design-tokens",
    fullName: "octodev/design-tokens",
    description: null,
    language: "CSS",
    languageColor: "#563d7c",
    stars: 7,
    forks: 1,
    isPrivate: false,
    openIssues: 0,
    openPRs: 0,
    updatedAt: daysAgo(14),
    htmlUrl: "https://github.com/octodev/design-tokens",
  },
];

export const MOCK_COMMITS: Commit[] = [
  {
    sha: "a1b2c3d",
    message: "feat(api): add cursor pagination to /v1/issues",
    authorName: "Octo Dev",
    authorAvatarUrl: MOCK_USER.avatarUrl,
    repo: "octodev/api",
    date: hoursAgo(2),
    htmlUrl: "https://github.com/octodev/api/commit/a1b2c3d",
  },
  {
    sha: "d4e5f60",
    message: "fix(web-dashboard): correct timezone drift in activity chart",
    authorName: "Octo Dev",
    authorAvatarUrl: MOCK_USER.avatarUrl,
    repo: "octodev/web-dashboard",
    date: hoursAgo(7),
    htmlUrl: "https://github.com/octodev/web-dashboard/commit/d4e5f60",
  },
  {
    sha: "0f9e8d7",
    message: "chore: bump go toolchain to 1.24",
    authorName: "Octo Dev",
    authorAvatarUrl: MOCK_USER.avatarUrl,
    repo: "octodev/cli-tools",
    date: hoursAgo(26),
    htmlUrl: "https://github.com/octodev/cli-tools/commit/0f9e8d7",
  },
  {
    sha: "6c5b4a3",
    message: "refactor(api): extract auth middleware into pkg/auth",
    authorName: "Octo Dev",
    authorAvatarUrl: MOCK_USER.avatarUrl,
    repo: "octodev/api",
    date: daysAgo(2),
    htmlUrl: "https://github.com/octodev/api/commit/6c5b4a3",
  },
  {
    sha: "2d1c0b9",
    message: "docs: update contribution guide",
    authorName: "Octo Dev",
    authorAvatarUrl: MOCK_USER.avatarUrl,
    repo: "octodev/design-tokens",
    date: daysAgo(4),
    htmlUrl: "https://github.com/octodev/design-tokens/commit/2d1c0b9",
  },
];

import type { Contributions, Issue, PullRequest, Task } from "./types";

export const MOCK_PULL_REQUESTS: PullRequest[] = [
  {
    id: 101,
    title: "feat: cursor pagination for issues endpoint",
    repo: "octodev/api",
    number: 48,
    author: "octodev",
    authorAvatarUrl: MOCK_USER.avatarUrl,
    state: "open",
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(1),
    additions: 212,
    deletions: 30,
    htmlUrl: "https://github.com/octodev/api/pull/48",
  },
  {
    id: 102,
    title: "fix: timezone drift in activity chart",
    repo: "octodev/web-dashboard",
    number: 17,
    author: "octodev",
    authorAvatarUrl: MOCK_USER.avatarUrl,
    state: "draft",
    createdAt: hoursAgo(9),
    updatedAt: hoursAgo(2),
    additions: 34,
    deletions: 12,
    htmlUrl: "https://github.com/octodev/web-dashboard/pull/17",
  },
  {
    id: 103,
    title: "feat: interactive `acct auth login` flow",
    repo: "octodev/cli-tools",
    number: 92,
    author: "octodev",
    authorAvatarUrl: MOCK_USER.avatarUrl,
    state: "open",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    additions: 480,
    deletions: 21,
    htmlUrl: "https://github.com/octodev/cli-tools/pull/92",
  },
  {
    id: 104,
    title: "chore: module split for pkg/auth",
    repo: "octodev/api",
    number: 47,
    author: "octodev",
    authorAvatarUrl: MOCK_USER.avatarUrl,
    state: "merged",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(3),
    additions: 150,
    deletions: 180,
    htmlUrl: "https://github.com/octodev/api/pull/47",
  },
];

export const MOCK_ISSUES: Issue[] = [
  {
    id: 201,
    title: "Rate limiter returns 500 instead of 429 under burst load",
    repo: "octodev/api",
    number: 61,
    author: "bursty",
    authorAvatarUrl: "https://avatars.githubusercontent.com/u/61042?v=4",
    state: "open",
    labels: ["bug", "priority: high"],
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(1),
    htmlUrl: "https://github.com/octodev/api/issues/61",
  },
  {
    id: 202,
    title: "Dashboard chart legend overlaps on small screens",
    repo: "octodev/web-dashboard",
    number: 23,
    author: "smallscreen",
    authorAvatarUrl: "https://avatars.githubusercontent.com/u/61042?v=4",
    state: "open",
    labels: ["bug", "ui"],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    htmlUrl: "https://github.com/octodev/web-dashboard/issues/23",
  },
  {
    id: 203,
    title: "Add `--json` output flag to `acct issues list`",
    repo: "octodev/cli-tools",
    number: 88,
    author: "jsonfan",
    authorAvatarUrl: "https://avatars.githubusercontent.com/u/61042?v=4",
    state: "open",
    labels: ["enhancement", "good first issue"],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
    htmlUrl: "https://github.com/octodev/cli-tools/issues/88",
  },
  {
    id: 204,
    title: "Docs: document Terraform module versioning policy",
    repo: "octodev/infra-terraform",
    number: 9,
    author: "docsbot",
    authorAvatarUrl: "https://avatars.githubusercontent.com/u/61042?v=4",
    state: "open",
    labels: ["documentation"],
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
    htmlUrl: "https://github.com/octodev/infra-terraform/issues/9",
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "t-1",
    user_id: MOCK_USER.id,
    title: "Ship cursor pagination to /v1/issues",
    notes: "Blocked on review from @bursty. Add changelog entry before merge.",
    status: "in_progress",
    priority: "high",
    due_date: new Date(now + 1 * 86_400_000).toISOString().slice(0, 10),
    repo: "octodev/api",
    created_at: daysAgo(3),
    updated_at: hoursAgo(2),
  },
  {
    id: "t-2",
    user_id: MOCK_USER.id,
    title: "Fix timezone drift in activity chart",
    status: "todo",
    priority: "urgent",
    due_date: new Date(now - 1 * 86_400_000).toISOString().slice(0, 10),
    repo: "octodev/web-dashboard",
    created_at: daysAgo(2),
    updated_at: daysAgo(1),
  },
  {
    id: "t-3",
    user_id: MOCK_USER.id,
    title: "Write integration tests for auth middleware",
    status: "todo",
    priority: "medium",
    due_date: new Date(now + 5 * 86_400_000).toISOString().slice(0, 10),
    repo: "octodev/api",
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
  {
    id: "t-4",
    user_id: MOCK_USER.id,
    title: "Version and publish design-tokens@2.0",
    status: "todo",
    priority: "low",
    due_date: null,
    repo: "octodev/design-tokens",
    created_at: daysAgo(6),
    updated_at: daysAgo(6),
  },
  {
    id: "t-5",
    user_id: MOCK_USER.id,
    title: "Rotate Terraform state bucket credentials",
    status: "done",
    priority: "high",
    due_date: new Date(now - 3 * 86_400_000).toISOString().slice(0, 10),
    repo: "octodev/infra-terraform",
    created_at: daysAgo(8),
    updated_at: daysAgo(3),
  },
  {
    id: "t-6",
    user_id: MOCK_USER.id,
    title: "Review PR #92 (interactive login flow)",
    notes: "Check edge cases: expired device codes, network errors.",
    status: "in_progress",
    priority: "medium",
    due_date: new Date(now + 2 * 86_400_000).toISOString().slice(0, 10),
    repo: "octodev/cli-tools",
    created_at: daysAgo(2),
    updated_at: hoursAgo(5),
  },
];

/** Deterministic pseudo-random contribution data for the last 365 days. */
export function generateMockContributions(): Contributions {
  const byDay: Contributions["byDay"] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const totalDays = 365;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    const date = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getUTCDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.35 : 1;
    const rampUp = (totalDays - i) / totalDays; // more activity recently
    const r = rand();
    let count = 0;
    if (r < 0.18 * weekendFactor * (0.5 + rampUp)) count = 0;
    else if (r < 0.55) count = Math.round(rand() * 4 * weekendFactor);
    else if (r < 0.85) count = Math.round(3 + rand() * 7);
    else count = Math.round(8 + rand() * 14);
    byDay.push({ date, count });
  }

  const total = byDay.reduce((sum, d) => sum + d.count, 0);
  return { total, byDay, longestStreak: 0, currentStreak: 0 };
}


