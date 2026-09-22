// tests/stats.test.ts
import { describe, it, expect } from "vitest";
import {
  computeStreak,
  getMonSunWindow,
  calculateWeeklyHours,
  computeCurriculumProgress,
  getLast8WeeksBars,
} from "../lib/utils/stats";
import { StudyLog } from "../lib/types";

describe("computeStreak", () => {
  // Fix reference date: Wednesday 2026-09-23
  const refDate = new Date(2026, 8, 23, 12, 0, 0); // 2026-09-23

  it("returns 0 when there are no logs", () => {
    expect(computeStreak([], refDate)).toBe(0);
  });

  it("returns 1 when logging today only", () => {
    expect(computeStreak(["2026-09-23"], refDate)).toBe(1);
  });

  it("returns 1 when logging yesterday only (chain ending yesterday)", () => {
    expect(computeStreak(["2026-09-22"], refDate)).toBe(1);
  });

  it("returns 2 when logging today and yesterday", () => {
    expect(computeStreak(["2026-09-23", "2026-09-22"], refDate)).toBe(2);
  });

  it("returns 3 when logging today, yesterday, and 2 days ago", () => {
    expect(computeStreak(["2026-09-23", "2026-09-22", "2026-09-21"], refDate)).toBe(3);
  });

  it("returns 3 when chain ends yesterday (yesterday, -2 days, -3 days)", () => {
    expect(computeStreak(["2026-09-22", "2026-09-21", "2026-09-20"], refDate)).toBe(3);
  });

  it("returns 0 if the most recent log was 2 days ago (streak broken)", () => {
    expect(computeStreak(["2026-09-21", "2026-09-20"], refDate)).toBe(0);
  });

  it("handles gaps correctly: log today and log 3 days ago yields streak of 1", () => {
    expect(computeStreak(["2026-09-23", "2026-09-20"], refDate)).toBe(1);
  });

  it("deduplicates multiple logs on the same day", () => {
    const logs = [
      "2026-09-23T08:00:00Z",
      "2026-09-23T14:30:00Z",
      "2026-09-22T19:00:00Z",
      "2026-09-22T21:00:00Z",
    ];
    expect(computeStreak(logs, refDate)).toBe(2);
  });

  it("handles Date objects seamlessly", () => {
    const d1 = new Date(2026, 8, 23);
    const d2 = new Date(2026, 8, 22);
    expect(computeStreak([d1, d2], refDate)).toBe(2);
  });
});

describe("getMonSunWindow & calculateWeeklyHours", () => {
  // Wednesday 2026-09-23:
  // Mon: 2026-09-21, Sun: 2026-09-27
  const wedDate = new Date(2026, 8, 23, 10, 0, 0);

  it("calculates Monday–Sunday window for a weekday", () => {
    const window = getMonSunWindow(wedDate);
    expect(window.start).toBe("2026-09-21");
    expect(window.end).toBe("2026-09-27");
  });

  it("calculates Monday–Sunday window when reference date is Sunday", () => {
    const sunDate = new Date(2026, 8, 27, 22, 0, 0); // Sunday Sep 27
    const window = getMonSunWindow(sunDate);
    expect(window.start).toBe("2026-09-21");
    expect(window.end).toBe("2026-09-27");
  });

  it("calculates Monday–Sunday window when reference date is Monday", () => {
    const monDate = new Date(2026, 8, 21, 1, 0, 0); // Monday Sep 21
    const window = getMonSunWindow(monDate);
    expect(window.start).toBe("2026-09-21");
    expect(window.end).toBe("2026-09-27");
  });

  it("aggregates weekly study hours and evaluates target band", () => {
    const mockLogs: StudyLog[] = [
      {
        id: "1",
        user_id: "u1",
        log_date: "2026-09-21",
        minutes: 120, // 2h
        focus: "theory",
        week_id: 1,
        notes: null,
        created_at: "",
      },
      {
        id: "2",
        user_id: "u1",
        log_date: "2026-09-22",
        minutes: 180, // 3h
        focus: "build",
        week_id: 1,
        notes: null,
        created_at: "",
      },
      {
        id: "3",
        user_id: "u1",
        log_date: "2026-09-23",
        minutes: 180, // 3h (Total 8h)
        focus: "explain_test",
        week_id: 1,
        notes: null,
        created_at: "",
      },
      {
        id: "4",
        user_id: "u1",
        log_date: "2026-09-15", // Previous week - should be ignored
        minutes: 300,
        focus: "theory",
        week_id: 1,
        notes: null,
        created_at: "",
      },
    ];

    const stats = calculateWeeklyHours(mockLogs, wedDate);
    expect(stats.totalMinutes).toBe(480);
    expect(stats.hours).toBe(8.0);
    expect(stats.inBand).toBe(true); // between 7 and 10
    expect(stats.label).toBe("8.0h / 7–10h target");
  });

  it("indicates when hours are outside the 7–10h target band", () => {
    const mockLogs: StudyLog[] = [
      {
        id: "1",
        user_id: "u1",
        log_date: "2026-09-21",
        minutes: 60, // 1h
        focus: "theory",
        week_id: 1,
        notes: null,
        created_at: "",
      },
    ];

    const stats = calculateWeeklyHours(mockLogs, wedDate);
    expect(stats.hours).toBe(1.0);
    expect(stats.inBand).toBe(false);
  });
});

describe("getLast8WeeksBars", () => {
  it("returns exactly 8 weeks with the current week marked", () => {
    const refDate = new Date(2026, 8, 23);
    const bars = getLast8WeeksBars([], refDate);
    expect(bars.length).toBe(8);
    expect(bars[7].isCurrentWeek).toBe(true);
    expect(bars[0].isCurrentWeek).toBe(false);
  });
});

describe("computeCurriculumProgress", () => {
  it("computes 0% and week 1 when none are completed", () => {
    const res = computeCurriculumProgress([]);
    expect(res.completedMilestones).toBe(0);
    expect(res.percentage).toBe(0);
    expect(res.currentWeekId).toBe(1);
    expect(res.isComplete).toBe(false);
  });

  it("computes correct current week as lowest uncompleted", () => {
    const res = computeCurriculumProgress([1, 2]);
    expect(res.completedMilestones).toBe(2);
    expect(res.percentage).toBe(17); // 2/12 = 16.67% -> 17%
    expect(res.currentWeekId).toBe(3);
    expect(res.isComplete).toBe(false);
  });

  it("handles out-of-order completion", () => {
    // If user completed week 1 and 3, week 2 is still lowest uncompleted
    const res = computeCurriculumProgress([1, 3]);
    expect(res.completedMilestones).toBe(2);
    expect(res.currentWeekId).toBe(2);
  });

  it("detects when curriculum is 100% complete", () => {
    const all12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const res = computeCurriculumProgress(all12);
    expect(res.completedMilestones).toBe(12);
    expect(res.percentage).toBe(100);
    expect(res.currentWeekId).toBeNull();
    expect(res.isComplete).toBe(true);
  });
});
