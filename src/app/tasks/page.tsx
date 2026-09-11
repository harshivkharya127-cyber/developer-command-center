import { TaskList, TaskListSkeleton, TaskStats } from "@/components/task-list";
import { EmptyState, ErrorState } from "@/components/states";
import { getServerDataProvider } from "@/lib/server-data-provider";

export const metadata = { title: "Tasks · Developer Command Center" };

export default async function TasksPage() {
  let tasks;
  try {
    const provider = await getServerDataProvider();
    tasks = await provider.getTasks();
  } catch (err) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <ErrorState message={err instanceof Error ? err.message : "Failed to load tasks."} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Your personal task list with status, priority, and due dates.
        </p>
      </div>
      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to track your work."
        />
      ) : null}
      <TaskStats tasks={tasks} />
      <TaskList initialTasks={tasks} />
    </div>
  );
}
