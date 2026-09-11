import type { DataProvider, CurrentUser } from "@/lib/data-provider";
import {
  MockDataProvider,
} from "@/lib/data-provider";
import type {
  Commit,
  Contributions,
  Issue,
  PullRequest,
  RepoCard,
  Task,
} from "@/lib/types";

/**
 * Delegates each surface to a specialized provider:
 *  - primary: GitHub surfaces (repos/commits/PRs/issues/contributions)
 *  - tasks: personal tasks + auth identity (Supabase or mock)
 */
export class ComposedProvider implements DataProvider {
  constructor(
    private readonly primary: DataProvider,
    private readonly tasks: DataProvider
  ) {}

  async getCurrentUser(): Promise<CurrentUser | null> {
    const user = await this.tasks.getCurrentUser();
    return user ?? (await this.primary.getCurrentUser());
  }

  async getRepos(): Promise<RepoCard[]> {
    return this.primary.getRepos();
  }
  async getRecentCommits(limit?: number): Promise<Commit[]> {
    return this.primary.getRecentCommits(limit);
  }
  async getOpenPullRequests(): Promise<PullRequest[]> {
    return this.primary.getOpenPullRequests();
  }
  async getOpenIssues(): Promise<Issue[]> {
    return this.primary.getOpenIssues();
  }
  async getContributions(): Promise<Contributions> {
    return this.primary.getContributions();
  }

  async getTasks(): Promise<Task[]> {
    return this.tasks.getTasks();
  }
  async createTask(
    task: Pick<Task, "title" | "status" | "priority"> &
      Partial<Pick<Task, "notes" | "due_date" | "repo">>
  ): Promise<Task> {
    return this.tasks.createTask(task);
  }
  async updateTask(id: string, patch: Partial<Task>): Promise<Task> {
    return this.tasks.updateTask(id, patch);
  }
  async deleteTask(id: string): Promise<void> {
    return this.tasks.deleteTask(id);
  }
}

export { MockDataProvider };
