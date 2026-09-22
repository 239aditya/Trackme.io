// lib/utils/stats.ts
import { StudyLog } from "@/lib/types";

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Compute the streak of consecutive calendar days with >=1 study log.
 * Rule: The chain may end today OR yesterday (logging in the evening shouldn't show a broken streak in the morning).
 */
export function computeStreak(logDates: (string | Date)[], referenceDate: Date = new Date()): number {
  if (!logDates || logDates.length === 0) {
    return 0;
  }

  // Normalize unique date strings (YYYY-MM-DD)
  const uniqueDateSet = new Set<string>();
  for (const item of logDates) {
    if (typeof item === "string") {
      // Extract YYYY-MM-DD portion
      const key = item.substring(0, 10);
      uniqueDateSet.add(key);
    } else if (item instanceof Date) {
      uniqueDateSet.add(formatDateKey(item));
    }
  }

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayKey = formatDateKey(today);
  const yesterdayKey = formatDateKey(yesterday);

  // If there are no logs today or yesterday, the streak is 0
  let currentCheck: Date;
  if (uniqueDateSet.has(todayKey)) {
    currentCheck = today;
  } else if (uniqueDateSet.has(yesterdayKey)) {
    currentCheck = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  const runner = new Date(currentCheck);

  while (true) {
    const key = formatDateKey(runner);
    if (uniqueDateSet.has(key)) {
      streak++;
      runner.setDate(runner.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Returns Monday (start) and Sunday (end) dates of the week containing referenceDate.
 * Monday is day 1, Sunday is day 7.
 */
export function getMonSunWindow(referenceDate: Date = new Date()): { start: string; end: string } {
  const d = new Date(referenceDate);
  d.setHours(0, 0, 0, 0);

  // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const day = d.getDay();
  // Distance to Monday: if Sunday (0), distance is -6; else 1 - day
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: formatDateKey(monday),
    end: formatDateKey(sunday),
  };
}

/**
 * Sum of minutes for the current Mon–Sun window, converted to hours (rounded to 1 decimal).
 */
export function calculateWeeklyHours(
  logs: StudyLog[],
  referenceDate: Date = new Date()
): { totalMinutes: number; hours: number; inBand: boolean; label: string } {
  const window = getMonSunWindow(referenceDate);

  const totalMinutes = logs
    .filter((log) => {
      const dateKey = log.log_date.substring(0, 10);
      return dateKey >= window.start && dateKey <= window.end;
    })
    .reduce((sum, log) => sum + (log.minutes || 0), 0);

  const hours = Math.round((totalMinutes / 60) * 10) / 10;
  // Target band: 7–10h target
  const inBand = hours >= 7 && hours <= 10;

  return {
    totalMinutes,
    hours,
    inBand,
    label: `${hours.toFixed(1)}h / 7–10h target`,
  };
}

export interface WeekBar {
  weekKey: string;
  weekLabel: string;
  hours: number;
  minutes: number;
  isCurrentWeek: boolean;
}

/**
 * Generates data for the last 8 calendar weeks (Mon–Sun) ending with the current week.
 */
export function getLast8WeeksBars(
  logs: StudyLog[],
  referenceDate: Date = new Date()
): WeekBar[] {
  const result: WeekBar[] = [];
  const currentWindow = getMonSunWindow(referenceDate);

  // Build 8 weeks from 7 weeks ago up to current week
  for (let i = 7; i >= 0; i--) {
    const target = new Date(referenceDate);
    target.setDate(target.getDate() - i * 7);
    const window = getMonSunWindow(target);

    // Sum minutes for this window
    const weekMinutes = logs
      .filter((log) => {
        const dateKey = log.log_date.substring(0, 10);
        return dateKey >= window.start && dateKey <= window.end;
      })
      .reduce((sum, log) => sum + (log.minutes || 0), 0);

    const hours = Math.round((weekMinutes / 60) * 10) / 10;

    // Label: e.g. "Sep 15" (Monday's date)
    const [year, month, day] = window.start.split("-").map(Number);
    const monDate = new Date(year, month - 1, day);
    const monthShort = monDate.toLocaleString("en-US", { month: "short" });
    const weekLabel = `${monthShort} ${day}`;

    result.push({
      weekKey: window.start,
      weekLabel,
      hours,
      minutes: weekMinutes,
      isCurrentWeek: window.start === currentWindow.start,
    });
  }

  return result;
}

/**
 * Compute curriculum progress:
 * - Count of weeks with milestone_done = true out of 12.
 * - Current week: lowest week id (1..12) whose milestone_done is false; if all done, null (complete).
 */
export function computeCurriculumProgress(
  milestoneDoneWeekIds: number[]
): {
  completedMilestones: number;
  totalWeeks: number;
  percentage: number;
  currentWeekId: number | null;
  isComplete: boolean;
} {
  const totalWeeks = 12;
  const doneSet = new Set(milestoneDoneWeekIds);
  const completedMilestones = doneSet.size;
  const percentage = Math.round((completedMilestones / totalWeeks) * 100);

  let currentWeekId: number | null = null;
  for (let id = 1; id <= totalWeeks; id++) {
    if (!doneSet.has(id)) {
      currentWeekId = id;
      break;
    }
  }

  return {
    completedMilestones,
    totalWeeks,
    percentage,
    currentWeekId,
    isComplete: currentWeekId === null,
  };
}
