import { describe, expect, it } from "vitest";

import { compactNumber, dueDateLabel, relativeTime } from "@/lib/date-utils";

describe("relativeTime", () => {
  const now = Date.parse("2026-09-11T12:00:00Z");

  it("returns 'just now' for very recent timestamps", () => {
    expect(relativeTime("2026-09-11T11:59:30Z", now)).toBe("just now");
  });

  it("formats minutes, hours, and days", () => {
    expect(relativeTime("2026-09-11T11:00:00Z", now)).toBe("1 hour ago");
    expect(relativeTime("2026-09-11T09:30:00Z", now)).toBe("3 hours ago");
    expect(relativeTime("2026-09-08T12:00:00Z", now)).toBe("3 days ago");
  });

  it("returns 'unknown' for invalid dates", () => {
    expect(relativeTime("not-a-date", now)).toBe("unknown");
  });
});

describe("dueDateLabel", () => {
  // Fixed "today": Friday, September 11 2026 (local).
  const now = new Date(2026, 8, 11, 12, 0, 0);

  it("handles missing and invalid dates", () => {
    expect(dueDateLabel(null, now)).toBe("No due date");
    expect(dueDateLabel("", now)).toBe("No due date");
    expect(dueDateLabel("garbage", now)).toBe("Invalid date");
  });

  it("labels today and tomorrow", () => {
    expect(dueDateLabel("2026-09-11", now)).toBe("Today");
    expect(dueDateLabel("2026-09-12", now)).toBe("Tomorrow");
  });

  it("labels past dates as overdue with the date", () => {
    expect(dueDateLabel("2026-09-10", now)).toBe("Overdue · Sep 10");
  });

  it("formats far-future dates as 'MMM d, yyyy'", () => {
    expect(dueDateLabel("2026-11-01", now)).toBe("Nov 1, 2026");
  });
});

describe("compactNumber", () => {
  it("leaves small numbers untouched", () => {
    expect(compactNumber(0)).toBe("0");
    expect(compactNumber(7)).toBe("7");
    expect(compactNumber(999)).toBe("999");
  });

  it("abbreviates thousands and millions", () => {
    expect(compactNumber(1000)).toBe("1k");
    expect(compactNumber(1200)).toBe("1.2k");
    expect(compactNumber(34000)).toBe("34k");
    expect(compactNumber(2_500_000)).toBe("2.5M");
  });
});
