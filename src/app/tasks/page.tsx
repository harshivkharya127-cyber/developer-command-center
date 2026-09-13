import { LogIn } from "lucide-react";

import { SignInButton } from "@/components/sign-in-button";
import { TaskList, TaskStats } from "@/components/task-list";
import { EmptyState, ErrorState } from "@/components/states";
import { Card, CardContent } from "@/components/ui/card";
import { getServerDataProvider } from "@/lib/server-data-provider";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Tasks · Developer Command Center" };

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function TasksPage() {
  let tasks;
  let signedIn = true;
  try {
    if (supabaseConfigured) {
      const supabase = await getSupabaseServerClient();
      const { data } = await supabase!.auth.getUser();
      signedIn = Boolean(data.user);
    }
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
      {supabaseConfigured && !signedIn ? (
        <>
          <Card>
            <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Sign in to sync your tasks</p>
                <p className="text-sm text-muted-foreground">
                  Tasks are stored per-user with Row Level Security, so each signed-in
                  developer only ever sees their own list.
                </p>
              </div>
              <SignInButton />
            </CardContent>
          </Card>
          <EmptyState
            icon={LogIn}
            title="Tasks are private to your account"
            description="Sign in with GitHub above to create and manage tasks that sync to the cloud."
          />
        </>
      ) : (
        <>
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Create your first task to track your work."
            />
          ) : null}
          <TaskStats tasks={tasks} />
          <TaskList initialTasks={tasks} />
        </>
      )}
    </div>
  );
}
