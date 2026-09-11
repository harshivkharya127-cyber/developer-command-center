import { describe, expect, it } from "vitest";

import { buildHeatmapGrid, computeStreaks, contributionLevel } from "@/lib/contribution-utils";
import type { ContributionDay } from "@/lib/types";

const day = (date: string, count: number): ContributionDay => ({ date, count });

describe("computeStreaks", () => {
  it("returns zeros for an empty list", () => {
    expect(computeStreaks([])).toEqual({ longestStreak: 0, currentStreak: 0 });
  });

  it("finds the longest run; trailing zero day keeps current streak alive", () => {
    const byDay = [
      day("2026-09-01", 1),
      day("2026-09-02", 0),
      day("2026-09-03", 2),
      day("2026-09-04", 3),
      day("2026-09-05", 1),
      day("2026-09-06", 0),
    ];
    expect(computeStreaks(byDay)).toEqual({ longestStreak: 3, currentStreak: 3 });
  });

  it("counts the current streak up to the last day", () => {
    const byDay = [
      day("2026-09-01", 1),
      day("2026-09-02", 1),
      day("2026-09-03", 0),
      day("2026-09-04", 4),
      day("2026-09-05", 2),
    ];
    expect(computeStreaks(byDay)).toEqual({ longestStreak: 2, currentStreak: 2 });
  });

  it("does not break the current streak on a trailing zero day (day not over)", () => {
    const byDay = [
      day("2026-09-01", 1),
      day("2026-09-02", 1),
      day("2026-09-03", 0),
    ];
    expect(computeStreaks(byDay)).toEqual({ longestStreak: 2, currentStreak: 2 });
  });

  it("is order-independent (sorts dates internally)", () => {
    const byDay = [
      day("2026-09-03", 1),
      day("2026-09-01", 1),
      day("2026-09-02", 1),
    ];
    expect(computeStreaks(byDay)).toEqual({ longestStreak: 3, currentStreak: 3 });
  });

  it("handles an all-zero year", () => {
    const byDay = [day("2026-09-01", 0), day("2026-09-02", 0)];
    expect(computeStreaks(byDay)).toEqual({ longestStreak: 0, currentStreak: 0 });
  });
});

describe("contributionLevel", () => {
  it("maps counts to 0-4 intensity buckets", () => {
    expect(contributionLevel(0)).toBe(0);
    expect(contributionLevel(1)).toBe(1);
    expect(contributionLevel(3)).toBe(1);
    expect(contributionLevel(4)).toBe(2);
    expect(contributionLevel(7)).toBe(2);
    expect(contributionLevel(8)).toBe(3);
    expect(contributionLevel(12)).toBe(3);
    expect(contributionLevel(13)).toBe(4);
    expect(contributionLevel(50)).toBe(4);
  });
});

describe("buildHeatmapGrid", () => {
  // Wednesday 2026-09-09 as the reference date; the grid ends on its Saturday.
  const reference = new Date("2026-09-09T12:00:00Z");

  it("produces weeks × 7 cells ending on the reference week's Saturday", () => {
    const grid = buildHeatmapGrid([], 2, reference);
    expect(grid).toHaveLength(2);
    grid.forEach((column) => expect(column).toHaveLength(7));
    // Last cell of the final column = Saturday 2026-09-12.
    expect(grid[1][6]?.date).toBe("2026-09-12");
  });

  it("aligns columns Sunday → Saturday", () => {
    const grid = buildHeatmapGrid([], 1, reference);
    expect(grid[0][0]?.date).toBe("2026-09-06"); // Sunday
    expect(grid[0][6]?.date).toBe("2026-09-12"); // Saturday
  });

  it("picks up counts from byDay and defaults missing days to 0", () => {
    const grid = buildHeatmapGrid([day("2026-09-09", 5)], 1, reference);
    const wednesday = grid[0][3]; // Sun 06, Mon 07, Tue 08, Wed 09
    expect(wednesday).toEqual({ date: "2026-09-09", count: 5 });
    expect(grid[0][0]).toEqual({ date: "2026-09-06", count: 0 });
  });
});
