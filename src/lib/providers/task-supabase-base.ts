import type { SupabaseClient } from "@supabase/supabase-js";

import type { CurrentUser } from "@/lib/data-provider";
import type { Task } from "@/lib/types";

/**
 * Shared Supabase task CRUD. Subclasses only supply the context-appropriate
 * client (browser vs server), which keeps `next/headers` out of client bundles.
 */
export abstract class BaseSupabaseTaskProvider {
  protected abstract getClient(): Promise<SupabaseClient | null>;

  async getCurrentUser(): Promise<CurrentUser | null> {
    const supabase = await this.getClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const meta = data.user.user_metadata as {
      avatar_url?: string;
      user_name?: string;
      name?: string;
      full_name?: string;
    };
    return {
      id: data.user.id,
      login: meta.user_name ?? "github",
      name: meta.name ?? meta.full_name ?? meta.user_name ?? "Signed in",
      avatarUrl: meta.avatar_url ?? "",
    };
  }

  async getTasks(): Promise<Task[]> {
    const supabase = await this.getClient();
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as Task[];
  }

  async createTask(
    task: Pick<Task, "title" | "status" | "priority"> &
      Partial<Pick<Task, "notes" | "due_date" | "repo">>
  ): Promise<Task> {
    const supabase = await this.getClient();
    if (!supabase) throw new Error("Supabase not configured");
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Not signed in");
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: auth.user.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        notes: task.notes ?? null,
        due_date: task.due_date ?? null,
        repo: task.repo ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Task;
  }

  async updateTask(id: string, patch: Partial<Task>): Promise<Task> {
    const supabase = await this.getClient();
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from("tasks")
      .update({
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        ...(patch.due_date !== undefined ? { due_date: patch.due_date } : {}),
        ...(patch.repo !== undefined ? { repo: patch.repo } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Task;
  }

  async deleteTask(id: string): Promise<void> {
    const supabase = await this.getClient();
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  // GitHub surfaces are delegated to the GitHub provider — never here.
  async getRepos() {
    return [];
  }
  async getRecentCommits(_limit?: number) {
    return [];
  }
  async getOpenPullRequests() {
    return [];
  }
  async getOpenIssues() {
    return [];
  }
  async getContributions() {
    return { total: 0, byDay: [], longestStreak: 0, currentStreak: 0 };
  }
}
