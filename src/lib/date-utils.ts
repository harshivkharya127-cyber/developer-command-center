import { formatDistanceToNowStrict, format, isToday, isTomorrow, isYesterday } from "date-fns";

/** "3h ago", "2d ago", "just now" — compact relative timestamps for feeds. */
export function relativeTime(iso: string, now = Date.now()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown";
  const diffMs = now - date.getTime();
  if (diffMs < 45_000) return "just now";
  return `${formatDistanceToNowStrict(date, { addSuffix: false })} ago`;
}

/** Human label for a task due date: "Today", "Tomorrow", "Mar 3", or "Overdue". */
export function dueDateLabel(
  dueDate: string | null | undefined,
  now = new Date()
): string {
  if (!dueDate) return "No due date";
  const date = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round(
    (date.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
      86_400_000
  );

  if (diffDays < 0) return `Overdue · ${format(date, "MMM d")}`;
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isYesterday(date)) return `Yesterday`;
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
