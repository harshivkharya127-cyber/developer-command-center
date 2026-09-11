// Core domain models shared across the app.

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null; // ISO date (yyyy-mm-dd)
  repo?: string | null; // e.g. "acme/api"
  created_at: string;
  updated_at: string;
}

export interface RepoCard {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  languageColor?: string | null;
  stars: number;
  forks: number;
  isPrivate: boolean;
  openIssues: number;
  openPRs?: number | null;
  updatedAt: string;
  htmlUrl: string;
}

export interface Commit {
  sha: string;
  message: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  repo: string;
  date: string;
  htmlUrl: string;
}

export interface PullRequest {
  id: number;
  title: string;
  repo: string;
  number: number;
  author: string;
  authorAvatarUrl?: string | null;
  state: "open" | "closed" | "merged" | "draft";
  createdAt: string;
  updatedAt: string;
  additions?: number | null;
  deletions?: number | null;
  htmlUrl: string;
}

export interface Issue {
  id: number;
  title: string;
  repo: string;
  number: number;
  author: string;
  authorAvatarUrl?: string | null;
  state: "open" | "closed";
  labels: string[];
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface ContributionDay {
  date: string; // yyyy-mm-dd
  count: number;
}

export interface Contributions {
  total: number;
  byDay: ContributionDay[];
  longestStreak: number;
  currentStreak: number;
}

// Standard result shape so every surface can render loading/empty/error states.
export type DataResult<T> = { data: T; error: null } | { data: null; error: string };

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
