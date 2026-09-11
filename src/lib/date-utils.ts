import { format } from "date-fns";

const TIME_STEPS: [number, string][] = [
  [31_536_000, "year"],
  [2_592_000, "month"],
  [604_800, "week"],
  [86_400, "day"],
  [3_600, "hour"],
  [60, "minute"],
];

/**
 * "3 hours ago", "just now" — compact relative timestamps for feeds.
 * Fully derived from the (injectable) `now` — no hidden system-clock reads —
 * so it is deterministic and testable.
 */
export function relativeTime(iso: string, now = Date.now()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown";
  const diffSec = Math.round((now - date.getTime()) / 1000);
  if (diffSec < 45) return "just now";

  for (const [stepSecs, unit] of TIME_STEPS) {
    if (diffSec >= stepSecs) {
      const value = Math.round(diffSec / stepSecs);
      return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}

/**
 * Human label for a task due date: "Today", "Tomorrow", "Overdue · Sep 10",
 * a weekday within the next week, or "Nov 1, 2026" beyond that.
 * Fully derived from the (injectable) `now` — no hidden system-clock reads —
 * so it is deterministic and testable.
 */
export function dueDateLabel(dueDate: string | null | undefined, now = new Date()): string {
  if (!dueDate) return "No due date";
  const date = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) return `Overdue · ${format(date, "MMM d")}`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return format(date, "EEEE");
  return format(date, "MMM d, yyyy");
}

/** Compact number formatting: 1.2k, 34k, etc. */
export function compactNumber(n: number): string {
  if (Math.abs(n) < 1000) return String(n);
  const units = ["k", "M", "B"];
  let value = n;
  let unit = -1;
  while (Math.abs(value) >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${Number(value.toFixed(1))}${units[unit]}`;
}
