"use client";

import {
  CalendarDays,
  ListTodo,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientDataProvider } from "@/lib/client-data-provider";
import { dueDateLabel, relativeTime } from "@/lib/date-utils";
import {
  filterTasks,
  isOverdue,
  sortTasks,
  type TaskSortField,
} from "@/lib/task-utils";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  high: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  urgent: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  done: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  // Filters & sorting (client-side, pure utilities)
  const [statusFilter, setStatusFilter] = React.useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = React.useState<TaskPriority | "all">("all");
  const [search, setSearch] = React.useState("");
  const [overdueOnly, setOverdueOnly] = React.useState(false);
  const [sortField, setSortField] = React.useState<TaskSortField>("priority");

  // New-task form
  const [formOpen, setFormOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = React.useState("");
  const [repo, setRepo] = React.useState("");

  const visible = React.useMemo(
    () =>
      sortTasks(
        filterTasks(tasks, {
          status: statusFilter,
          priority: priorityFilter,
          search,
          showOverdueOnly: overdueOnly,
        }),
        sortField
      ),
    [tasks, statusFilter, priorityFilter, search, overdueOnly, sortField]
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const task = await clientDataProvider.createTask({
        title: title.trim(),
        status: "todo",
        priority,
        due_date: dueDate || null,
        repo: repo.trim() || null,
      });
      setTasks((prev) => [task, ...prev]);
      setTitle("");
      setDueDate("");
      setRepo("");
      setPriority("medium");
      setFormOpen(false);
    } catch {
      setError("Failed to create task. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleDone(task: Task) {
    setBusyId(task.id);
    setError(null);
    try {
      const nextStatus: TaskStatus = task.status === "done" ? "todo" : "done";
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
      await clientDataProvider.updateTask(task.id, { status: nextStatus });
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setError("Failed to update task. Change reverted.");
    } finally {
      setBusyId(null);
    }
  }

  async function changeStatus(task: Task, status: TaskStatus) {
    setBusyId(task.id);
    setError(null);
    try {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
      await clientDataProvider.updateTask(task.id, { status });
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setError("Failed to update task. Change reverted.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(task: Task) {
    setBusyId(task.id);
    setError(null);
    const snapshot = tasks;
    try {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      await clientDataProvider.deleteTask(task.id);
    } catch {
      setTasks(snapshot);
      setError("Failed to delete task. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? <ErrorState message={error} /> : null}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={priorityFilter}
          onValueChange={(v) => setPriorityFilter(v as TaskPriority | "all")}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {TASK_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {TASK_PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={overdueOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setOverdueOnly((v) => !v)}
        >
          Overdue
        </Button>
        <Select value={sortField} onValueChange={(v) => setSortField(v as TaskSortField)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Sort: Priority</SelectItem>
            <SelectItem value="due_date">Sort: Due date</SelectItem>
            <SelectItem value="created_at">Sort: Newest</SelectItem>
            <SelectItem value="status">Sort: Status</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setFormOpen((v) => !v)}>
          <Plus className="h-4 w-4" /> New task
        </Button>
      </div>


      {/* New task form */}
      {formOpen ? (
        <form
          onSubmit={handleCreate}
          className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[2fr_1fr_1fr_1fr]"
        >
          <div className="sm:col-span-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>
          <div>
            <Label htmlFor="task-priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger id="task-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {TASK_PRIORITY_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="task-due">Due date</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="task-repo">Repo</Label>
            <Input
              id="task-repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="owner/name (optional)"
            />
          </div>
          <div className="flex items-end gap-2 sm:col-span-2">
            <Button type="submit" disabled={creating || !title.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add task
            </Button>
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}


      {/* Task rows */}
      {visible.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks match your filters"
          description="Try clearing filters or create a new task to get started."
        />
      ) : (
        <ul className="space-y-2">
          {visible.map((task) => {
            const overdue = isOverdue(task);
            const busy = busyId === task.id;
            return (
              <li
                key={task.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 transition-opacity",
                  task.status === "done" && "opacity-60",
                  overdue && "border-destructive/40"
                )}
              >
                <Checkbox
                  className="mt-1"
                  checked={task.status === "done"}
                  disabled={busy}
                  onCheckedChange={() => toggleDone(task)}
                  aria-label={`Mark "${task.title}" as ${task.status === "done" ? "to do" : "done"}`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium leading-snug",
                      task.status === "done" && "line-through"
                    )}
                  >
                    {task.title}
                  </p>
                  {task.notes ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{task.notes}</p>
                  ) : null}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className={cn("border-transparent", STATUS_STYLES[task.status])}
                    >
                      {TASK_STATUS_LABELS[task.status]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("border-transparent", PRIORITY_STYLES[task.priority])}
                    >
                      {TASK_PRIORITY_LABELS[task.priority]}
                    </Badge>
                    {task.repo ? <span className="font-mono text-[11px]">{task.repo}</span> : null}
                    {task.due_date ? (
                      <span
                        className={cn(
                          "flex items-center gap-1",
                          overdue && "font-medium text-destructive"
                        )}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        {dueDateLabel(task.due_date)}
                      </span>
                    ) : null}
                    <span>· updated {relativeTime(task.updated_at)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Select
                    value={task.status}
                    onValueChange={(v) => changeStatus(task, v as TaskStatus)}
                    disabled={busy}
                  >
                    <SelectTrigger
                      className="h-8 w-28 text-xs"
                      aria-label={`Change status of ${task.title}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {TASK_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(task)}
                    disabled={busy}
                    aria-label={`Delete task ${task.title}`}
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function TaskStats({ tasks }: { tasks: Task[] }) {
  const todo = tasks.filter((t) => t.status === "todo").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter((t) => isOverdue(t)).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">Task summary</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "To Do", value: todo },
          { label: "In Progress", value: inProgress },
          { label: "Done", value: done },
          { label: "Overdue", value: overdue, danger: true },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border p-3">
            <p className={cn("text-xl font-semibold tabular-nums", s.danger && "text-destructive")}>
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TaskListSkeleton() {
  return <LoadingSkeleton rows={5} />;
}


