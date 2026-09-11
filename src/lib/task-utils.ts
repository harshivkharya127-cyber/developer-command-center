import type { Task, TaskPriority, TaskStatus } from "./types";

export const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const STATUS_RANK: Record<TaskStatus, number> = {
  in_progress: 0,
  todo: 1,
  done: 2,
};

export type TaskSortField = "priority" | "due_date" | "created_at" | "status";

/** Compare two tasks by an explicit sort field; stable and deterministic. */
export function compareTasks(a: Task, b: Task, field: TaskSortField): number {
  switch (field) {
    case "priority": {
      const byRank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (byRank !== 0) return byRank;
      return compareByDueDate(a, b);
    }
    case "status": {
      const byRank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      if (byRank !== 0) return byRank;
      return compareByDueDate(a, b);
    }
    case "created_at":
      return b.created_at.localeCompare(a.created_at); // newest first
    case "due_date":
      return compareByDueDate(a, b);
  }
}

/**
 * Tasks without a due date sort last; ties broken by priority rank.
 * Earlier due dates come first.
 */
export function compareByDueDate(a: Task, b: Task): number {
  if (a.due_date === b.due_date) {
    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  }
  if (a.due_date == null) return 1;
  if (b.due_date == null) return -1;
  return a.due_date.localeCompare(b.due_date);
}

export function sortTasks(tasks: Task[], field: TaskSortField): Task[] {
  return [...tasks].sort((a, b) => compareTasks(a, b, field));
}

export interface TaskFilters {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  search?: string;
  showOverdueOnly?: boolean;
}

/** Pure filter over tasks; empty/undefined filters are no-ops. */
export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const search = filters.search?.trim().toLowerCase();
  const today = new Date().toISOString().slice(0, 10);

  return tasks.filter((task) => {
    if (filters.status && filters.status !== "all" && task.status !== filters.status) {
      return false;
    }
    if (filters.priority && filters.priority !== "all" && task.priority !== filters.priority) {
      return false;
    }
    if (
      filters.showOverdueOnly &&
      !(task.due_date && task.due_date < today && task.status !== "done")
    ) {
      return false;
    }
    if (search) {
      const haystack = `${task.title} ${task.repo ?? ""} ${task.notes ?? ""}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

/** True when the due date is strictly before today and the task isn't done. */
export function isOverdue(task: Task, today = new Date().toISOString().slice(0, 10)): boolean {
  return Boolean(task.due_date && task.due_date < today && task.status !== "done");
}

/** Aggregate counts by status, useful for dashboard stat cards. */
export function countByStatus(tasks: Task[]): Record<TaskStatus, number> {
  return tasks.reduce(
    (acc, task) => {
      acc[task.status] += 1;
      return acc;
    },
    { todo: 0, in_progress: 0, done: 0 } as Record<TaskStatus, number>
  );
}
