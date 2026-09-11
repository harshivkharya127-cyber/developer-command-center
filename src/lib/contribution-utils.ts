import type { ContributionDay } from "./types";

/**
 * Compute longest and current contribution streaks from a list of days.
 * A streak is a run of consecutive days with count > 0. The current streak
 * counts backward from the most recent day and stops at the first zero day.
 */
export function computeStreaks(byDay: ContributionDay[]): {
  longestStreak: number;
  currentStreak: number;
} {
  const sorted = [...byDay].sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0;
  let run = 0;
  for (const day of sorted) {
    if (day.count > 0) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  // Current streak: walk backward from the latest day. Allow the very last
  // day to be a zero day (day isn't over yet) without breaking the streak.
  let current = 0;
  let i = sorted.length - 1;
  if (i >= 0 && sorted[i].count === 0) i -= 1;
  for (; i >= 0; i--) {
    if (sorted[i].count > 0) current += 1;
    else break;
  }

  return { longestStreak: longest, currentStreak: current };
}

/** Map a contribution count to a 0-4 intensity level (GitHub heatmap style). */
export function contributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count <= 3) return 1;
  if (count <= 7) return 2;
  if (count <= 12) return 3;
  return 4;
}

/**
 * Resample byDay onto a fixed grid of `weeks` columns × 7 rows, ending at the
 * most recent day. Weeks start on Sunday. Missing days default to 0.
 */
export function buildHeatmapGrid(
  byDay: ContributionDay[],
  weeks: number,
  referenceDate = new Date()
): (ContributionDay | null)[][] {
  const byDate = new Map(byDay.map((d) => [d.date, d.count]));
  const end = new Date(referenceDate);
  // Align end to the last cell of the grid (Saturday of the final week).
  end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

  const grid: (ContributionDay | null)[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const column: (ContributionDay | null)[] = [];
    for (let dow = 6; dow >= 0; dow--) {
      const cell = new Date(end);
      cell.setUTCDate(end.getUTCDate() - (w * 7 + dow));
      const date = cell.toISOString().slice(0, 10);
      column.push({ date, count: byDate.get(date) ?? 0 });
    }
    grid.push(column);
  }
  return grid;
}
