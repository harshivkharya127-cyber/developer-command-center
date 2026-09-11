import { computeStreaks } from "./contribution-utils";
import {
  MOCK_COMMITS,
  MOCK_ISSUES,
  MOCK_PULL_REQUESTS,
  MOCK_REPOS,
  MOCK_TASKS,
  MOCK_USER,
  generateMockContributions,
} from "./mock-data";
import type {
  Commit,
  Contributions,
  Issue,
  PullRequest,
  RepoCard,
  Task,
} from "./types";

export interface CurrentUser {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
}

/**
 * The single seam the UI talks to. Phase 4 swaps the mock implementation for a
 * Supabase-backed one; Phase 5 adds a GitHub-backed implementation for the
 * repository/commit/PR/issue data. UI code never imports providers directly.
 */
export interface DataProvider {
  getCurrentUser(): Promise<CurrentUser | null>;
  getRepos(): Promise<RepoCard[]>;
  getRecentCommits(limit?: number): Promise<Commit[]>;
  getOpenPullRequests(): Promise<PullRequest[]>;
  getOpenIssues(): Promise<Issue[]>;
  getContributions(): Promise<Contributions>;
  getTasks(): Promise<Task[]>;
  createTask(
    task: Pick<Task, "title" | "status" | "priority"> &
      Partial<Pick<Task, "notes" | "due_date" | "repo">>
  ): Promise<Task>;
  updateTask(id: string, patch: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}

export class MockDataProvider implements DataProvider {
  async getCurrentUser(): Promise<CurrentUser | null> {
    return MOCK_USER;
  }

  async getRepos(): Promise<RepoCard[]> {
    return structuredClone(MOCK_REPOS);
  }

  async getRecentCommits(limit = 5): Promise<Commit[]> {
    return structuredClone(MOCK_COMMITS).slice(0, limit);
  }

  async getOpenPullRequests(): Promise<PullRequest[]> {
    return structuredClone(MOCK_PULL_REQUESTS).filter(
      (pr) => pr.state === "open" || pr.state === "draft"
    );
  }

  async getOpenIssues(): Promise<Issue[]> {
    return structuredClone(MOCK_ISSUES).filter((issue) => issue.state === "open");
  }

  async getContributions(): Promise<Contributions> {
    const contributions = generateMockContributions();
    return {
      ...contributions,
      ...computeStreaks(contributions.byDay),
    };
  }

  async getTasks(): Promise<Task[]> {
    return structuredClone(MOCK_TASKS);
  }

  async createTask(
    task: Pick<Task, "title" | "status" | "priority"> &
      Partial<Pick<Task, "notes" | "due_date" | "repo">>
  ): Promise<Task> {
    const timestamp = new Date().toISOString();
    return {
      id: `t-${Math.random().toString(36).slice(2, 10)}`,
      user_id: MOCK_USER.id,
      title: task.title,
      notes: task.notes ?? null,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ?? null,
      repo: task.repo ?? null,
      created_at: timestamp,
      updated_at: timestamp,
    };
  }

  async updateTask(id: string, patch: Partial<Task>): Promise<Task> {
    const all = await this.getTasks();
    const existing = all.find((t) => t.id === id);
    if (!existing) throw new Error(`Task ${id} not found`);
    return { ...existing, ...patch, id, updated_at: new Date().toISOString() };
  }

  async deleteTask(): Promise<void> {
    return;
  }
}
// In a larger app this would come from a config module. Keeping it simple:
// Phase 4 replaces this with a provider-aware factory.
export const dataProvider: DataProvider = new MockDataProvider();
