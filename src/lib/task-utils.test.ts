import { describe, expect, it } from "vitest";

import {
  countByStatus,
  filterTasks,
  isOverdue,
  sortTasks,
} from "@/lib/task-utils";
import type { Task } from "@/lib/types";

/** Deterministic task factory — tests must not depend on the real clock. */
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t-1",
    user_id: "user-1",
    title: "Task",
    notes: null,
    status: "todo",
    priority: "medium",
    due_date: null,
    repo: null,
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("sortTasks", () => {
  it("sorts by priority rank: urgent → high → medium → low", () => {
    const tasks = [
      makeTask({ id: "low", priority: "low" }),
      makeTask({ id: "urgent", priority: "urgent" }),
      makeTask({ id: "medium", priority: "medium" }),
      makeTask({ id: "high", priority: "high" }),
    ];
    expect(sortTasks(tasks, "priority").map((t) => t.id)).toEqual([
      "urgent",
      "high",
      "medium",
      "low",
    ]);
  });

  it("breaks priority ties by due date (earlier first)", () => {
    const tasks = [
      makeTask({ id: "a", priority: "high", due_date: "2026-10-01" }),
      makeTask({ id: "b", priority: "high", due_date: "2026-09-15" }),
    ];
    expect(sortTasks(tasks, "priority").map((t) => t.id)).toEqual(["b", "a"]);
  });

  it("places tasks without a due date last", () => {
    const tasks = [
      makeTask({ id: "none", priority: "urgent", due_date: null }),
      makeTask({ id: "dated", priority: "low", due_date: "2026-12-01" }),
    ];
    expect(sortTasks(tasks, "due_date").map((t) => t.id)).toEqual([
      "dated",
      "none",
    ]);
  });

  it("sorts by due date ascending with nulls last", () => {
    const tasks = [
      makeTask({ id: "c", due_date: "2026-11-01", priority: "low" }),
      makeTask({ id: "a", due_date: null, priority: "low" }),
      makeTask({ id: "b", due_date: "2026-09-20", priority: "low" }),
      makeTask({ id: "d", due_date: null, priority: "urgent" }),
    ];
    expect(sortTasks(tasks, "due_date").map((t) => t.id)).toEqual([
      "b",
      "c",
      "d",
      "a",
    ]);
  });

  it("sorts by status: in_progress → todo → done", () => {
    const tasks = [
      makeTask({ id: "done", status: "done" }),
      makeTask({ id: "in_progress", status: "in_progress" }),
      makeTask({ id: "todo", status: "todo" }),
    ];
    expect(sortTasks(tasks, "status").map((t) => t.id)).toEqual([
      "in_progress",
      "todo",
      "done",
    ]);
  });

  it("sorts by created_at newest first", () => {
    const tasks = [
      makeTask({ id: "old", created_at: "2026-08-01T00:00:00.000Z" }),
      makeTask({ id: "new", created_at: "2026-09-10T00:00:00.000Z" }),
    ];
    expect(sortTasks(tasks, "created_at").map((t) => t.id)).toEqual([
      "new",
      "old",
    ]);
  });

  it("does not mutate the input array", () => {
    const tasks = [
      makeTask({ id: "low", priority: "low" }),
      makeTask({ id: "urgent", priority: "urgent" }),
    ];
    sortTasks(tasks, "priority");
    expect(tasks.map((t) => t.id)).toEqual(["low", "urgent"]);
  });
});

describe("filterTasks", () => {
  const tasks = [
    makeTask({ id: "1", status: "todo", priority: "urgent", title: "Fix login bug", repo: "acme/api" }),
    makeTask({ id: "2", status: "in_progress", priority: "low", title: "Write docs", notes: "README update" }),
    makeTask({ id: "3", status: "done", priority: "high", title: "Ship release", due_date: "2026-09-01" }),
  ];

  it("filters by status", () => {
    expect(filterTasks(tasks, { status: "done" }).map((t) => t.id)).toEqual(["3"]);
  });

  it("filters by priority", () => {
    expect(filterTasks(tasks, { priority: "urgent" }).map((t) => t.id)).toEqual(["1"]);
  });

  it("searches across title, repo, and notes case-insensitively", () => {
    expect(filterTasks(tasks, { search: "acme" }).map((t) => t.id)).toEqual(["1"]);
    expect(filterTasks(tasks, { search: "readme" }).map((t) => t.id)).toEqual(["2"]);
    expect(filterTasks(tasks, { search: "  SHIP  " }).map((t) => t.id)).toEqual(["3"]);
  });

  it("returns everything for empty filters", () => {
    expect(filterTasks(tasks, {})).toHaveLength(3);
    expect(filterTasks(tasks, { status: "all", priority: "all" })).toHaveLength(3);
  });
});

describe("isOverdue", () => {
  const today = "2026-09-11";

  it("is true for an incomplete task due before today", () => {
    expect(isOverdue(makeTask({ due_date: "2026-09-10" }), today)).toBe(true);
  });

  it("is false for a done task due before today", () => {
    expect(isOverdue(makeTask({ due_date: "2026-09-10", status: "done" }), today)).toBe(false);
  });

  it("is false for a task due today (not yet overdue)", () => {
    expect(isOverdue(makeTask({ due_date: "2026-09-11" }), today)).toBe(false);
  });

  it("is false for future due dates", () => {
    expect(isOverdue(makeTask({ due_date: "2026-09-12" }), today)).toBe(false);
  });

  it("is false without a due date", () => {
    expect(isOverdue(makeTask({ due_date: null }), today)).toBe(false);
  });
});

describe("countByStatus", () => {
  it("aggregates counts per status bucket", () => {
    const tasks = [
      makeTask({ status: "todo" }),
      makeTask({ status: "todo" }),
      makeTask({ status: "in_progress" }),
      makeTask({ status: "done" }),
    ];
    expect(countByStatus(tasks)).toEqual({ todo: 2, in_progress: 1, done: 1 });
  });

  it("returns zeroed buckets for an empty list", () => {
    expect(countByStatus([])).toEqual({ todo: 0, in_progress: 0, done: 0 });
  });
});
