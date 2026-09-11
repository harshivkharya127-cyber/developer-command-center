"use client";

import * as React from "react";

import { EmptyState } from "@/components/states";
import { Skeleton } from "@/components/ui/skeleton";
import { buildHeatmapGrid, contributionLevel } from "@/lib/contribution-utils";
import { compactNumber } from "@/lib/date-utils";
import type { ContributionDay, Contributions } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVEL_STYLES = [
  "bg-muted",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/65",
  "bg-primary",
] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ContributionHeatmap({ data }: { data: Contributions }) {
  // Derive the grid's reference date from the data itself (its most recent
  // day) instead of the current time — keeps server render and client
  // hydration identical no matter when either executes.
  const grid = React.useMemo(() => {
    const last = data.byDay.reduce<ContributionDay | null>(
      (acc, d) => (!acc || d.date > acc.date ? d : acc),
      null
    );
    const reference = last ? new Date(`${last.date}T00:00:00Z`) : undefined;
    return buildHeatmapGrid(data.byDay, 26, reference);
  }, [data.byDay]);

  // Month labels: show label under the column where a month first appears.
  const monthLabels = React.useMemo(() => {
    return grid.map((column) => {
      const first = column[0]?.date;
      if (!first) return "";
      const d = new Date(`${first}T00:00:00Z`);
      return d.getUTCDate() <= 7 ? MONTHS[d.getUTCMonth()] : "";
    });
  }, [grid]);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {grid.map((column, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {column.map((cell) =>
              cell ? (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.count} contribution${cell.count === 1 ? "" : "s"}`}
                  className={cn("heatmap-cell h-3 w-3", LEVEL_STYLES[contributionLevel(cell.count)])}
                />
              ) : null
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-1 overflow-x-auto text-[10px] text-muted-foreground">
        {monthLabels.map((label, i) => (
          <span key={i} className="w-3 shrink-0 text-center">
            {label}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {LEVEL_STYLES.map((style, i) => (
          <span key={i} className={cn("heatmap-cell h-3 w-3", style)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export function ContributionStats({ data }: { data: Contributions }) {
  const stats = [
    { label: "Contributions (1y)", value: compactNumber(data.total) },
    { label: "Current streak", value: `${data.currentStreak}d` },
    { label: "Longest streak", value: `${data.longestStreak}d` },
    {
      label: "Best day",
      value: `${Math.max(0, ...data.byDay.map((d) => d.count))} contributions`,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border p-3">
          <p className="text-xl font-semibold tabular-nums">{s.value}</p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/** Wrapper that handles loading/empty/error for heatmap data. */
export function ContributionSection({
  contributions,
}: {
  contributions: Contributions;
}) {
  if (!contributions.byDay.some((d) => d.count > 0)) {
    return <EmptyState title="No contributions in the past year" />;
  }
  return (
    <div className="space-y-4">
      <ContributionStats data={contributions} />
      <ContributionHeatmap data={contributions} />
    </div>
  );
}

export function HeatmapSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[180px] w-full" />
    </div>
  );
}
