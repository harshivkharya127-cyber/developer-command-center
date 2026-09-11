import { AlertTriangle, Inbox } from "lucide-react";
import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Skeleton placeholder used while a data surface is loading. */
export function LoadingSkeleton({ className, rows = 3 }: { className?: string; rows?: number }) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

/** Friendly empty state for lists that legitimately have no data. */
export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center",
        className
      )}
    >
      <Icon className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="max-w-sm text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}

/** Error state shown when a data source fails. */
export function ErrorState({
  message = "Something went wrong while loading data. Please try again later.",
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center",
        className
      )}
    >
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <p className="max-w-sm text-sm text-destructive">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
