"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { STATIC_WEEKS } from "@/lib/data/curriculum";
import { StudyLog, StudyFocus, WeekProgress, STUDY_FOCUS_CONFIG } from "@/lib/types";
import {
  computeStreak,
  calculateWeeklyHours,
  getLast8WeeksBars,
  computeCurriculumProgress,
  formatDateKey,
} from "@/lib/utils/stats";
import {
  Flame,
  Clock,
  ArrowRight,
  Plus,
  Loader2,
  CheckCircle,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [weekProgressMap, setWeekProgressMap] = useState<Record<number, WeekProgress>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Quick-log form state
  const [minutes, setMinutes] = useState<number>(60);
  const [focus, setFocus] = useState<StudyFocus>("build");
  const [selectedWeekId, setSelectedWeekId] = useState<number | "">(1);
  const [notes, setNotes] = useState<string>("");
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [logSuccessMessage, setLogSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
        }

        const [logsRes, weekProgRes] = await Promise.all([
          supabase.from("study_logs").select("*").order("log_date", { ascending: false }),
          supabase.from("week_progress").select("*"),
        ]);

        if (logsRes.data) {
          setLogs(logsRes.data as StudyLog[]);
        }

        if (weekProgRes.data) {
          const map: Record<number, WeekProgress> = {};
          weekProgRes.data.forEach((p) => {
            map[p.week_id] = p as WeekProgress;
          });
          setWeekProgressMap(map);
        }
      } catch (err) {
        console.warn("Could not load dashboard data from Supabase", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Compute live metrics
  const doneMilestoneWeekIds = Object.values(weekProgressMap)
    .filter((p) => p.milestone_done)
    .map((p) => p.week_id);

  const curriculumProg = computeCurriculumProgress(doneMilestoneWeekIds);
  const streak = computeStreak(logs.map((l) => l.log_date));
  const weeklyHours = calculateWeeklyHours(logs);
  const eightWeeksBars = getLast8WeeksBars(logs);

  // Set default selected week in quick log form to current active week
  useEffect(() => {
    if (curriculumProg.currentWeekId) {
      setSelectedWeekId(curriculumProg.currentWeekId);
    }
  }, [curriculumProg.currentWeekId]);

  // Current active week metadata
  const currentWeekMeta = STATIC_WEEKS.find(
    (w) => w.id === (curriculumProg.currentWeekId || 12)
  );
  const currentWeekProg = curriculumProg.currentWeekId
    ? weekProgressMap[curriculumProg.currentWeekId]
    : null;

  // Handle Quick-Log Submit (Optimistic Update)
  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes < 5 || minutes > 600) return;

    setIsSubmittingLog(true);
    setLogSuccessMessage(null);

    const todayStr = formatDateKey(new Date());
    const tempId = `temp-${Date.now()}`;

    const newLog: StudyLog = {
      id: tempId,
      user_id: userId || "local-user",
      log_date: todayStr,
      minutes: Number(minutes),
      focus,
      week_id: selectedWeekId ? Number(selectedWeekId) : null,
      notes: notes.trim() || null,
      created_at: new Date().toISOString(),
    };

    // Optimistic state update: updates streak and hours immediately!
    setLogs((prev) => [newLog, ...prev]);
    setNotes("");
    setLogSuccessMessage(`Logged ${minutes}m of ${focus}!`);
    setTimeout(() => setLogSuccessMessage(null), 4000);

    try {
      if (userId) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("study_logs")
          .insert({
            user_id: userId,
            log_date: todayStr,
            minutes: Number(minutes),
            focus,
            week_id: selectedWeekId ? Number(selectedWeekId) : null,
            notes: notes.trim() || null,
          })
          .select()
          .single();

        if (data && !error) {
          // Replace temporary log with persistent record from DB
          setLogs((prev) => prev.map((l) => (l.id === tempId ? (data as StudyLog) : l)));
        }
      }
    } catch (err) {
      console.error("Error inserting study log", err);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Max hours in 8-week chart (minimum 10 to establish scale)
  const maxBarHours = Math.max(10, ...eightWeeksBars.map((b) => b.hours));

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Overview Headline */}
      <div>
        <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
          Curriculum Cockpit
        </span>
        <h1 className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
          Agentic AI Zero-Budget Tracker
        </h1>
        <p className="text-xs text-stone-600 dark:text-stone-400 font-mono mt-0.5">
          12 weeks • 14 starter sessions • 11 projects • 7–10 h/week target
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-stone-500 font-mono text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-teal-700 dark:text-teal-400" />
          <span>Loading curriculum stats...</span>
        </div>
      ) : (
        <>
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Overall Progress */}
            <div className="p-5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-500 dark:text-stone-400 font-medium">
                  Overall Progress
                </span>
                <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400">
                  {curriculumProg.isComplete
                    ? "Curriculum Complete"
                    : `Week ${curriculumProg.currentWeekId} of 12`}
                </span>
              </div>
              <div className="my-3">
                <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
                  {curriculumProg.completedMilestones}{" "}
                  <span className="text-sm font-normal text-stone-500">/ 12 milestones</span>
                </div>
              </div>
              <div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-700 dark:bg-teal-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${curriculumProg.percentage}%` }}
                  />
                </div>
                <div className="text-right text-[11px] font-mono text-stone-500 mt-1">
                  {curriculumProg.percentage}% complete
                </div>
              </div>
            </div>

            {/* 2. Current Streak */}
            <div className="p-5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-500 dark:text-stone-400 font-medium">
                  Current Streak
                </span>
                <Flame
                  className={`w-4 h-4 ${
                    streak > 0 ? "text-amber-600 dark:text-amber-400" : "text-stone-300"
                  }`}
                />
              </div>
              <div className="my-3">
                <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 flex items-baseline gap-1.5">
                  {streak}
                  <span className="text-sm font-normal text-stone-500">
                    {streak === 1 ? "day" : "consecutive days"}
                  </span>
                </div>
              </div>
              <p className="text-[11px] font-mono text-stone-500">
                {streak > 0
                  ? "Chain intact! Log daily to maintain velocity."
                  : "No active streak — log today's session below."}
              </p>
            </div>

            {/* 3. Hours This Week */}
            <div className="p-5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-500 dark:text-stone-400 font-medium">
                  Hours This Week (Mon–Sun)
                </span>
                <Clock className="w-4 h-4 text-stone-400" />
              </div>
              <div className="my-3">
                <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 flex items-baseline gap-1">
                  {weeklyHours.hours.toFixed(1)}h
                  <span className="text-sm font-normal text-stone-500">/ 7–10h</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded font-medium ${
                    weeklyHours.inBand
                      ? "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300"
                      : weeklyHours.hours > 10
                      ? "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                  }`}
                >
                  {weeklyHours.inBand
                    ? "✓ Target Band Achieved"
                    : weeklyHours.hours > 10
                    ? "Target Exceeded"
                    : `${Math.max(0, (7 - weeklyHours.hours)).toFixed(1)}h to target`}
                </span>
              </div>
            </div>
          </div>

          {/* Continue Card (Current Active Week) */}
          {currentWeekMeta && (
            <div className="p-5 sm:p-6 rounded-lg border border-teal-300 dark:border-teal-900/70 bg-gradient-to-r from-teal-50/40 via-white to-transparent dark:from-teal-950/20 dark:via-stone-900/60 dark:to-stone-900/20 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                    {curriculumProg.isComplete ? "Review Curriculum" : "Continue Current Week"}
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    Week {currentWeekMeta.id}
                  </span>
                </div>
                <h2 className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
                  {currentWeekMeta.title}
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 max-w-xl">
                  {currentWeekMeta.goal}
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-stone-500">
                  <span>Milestone: {currentWeekProg?.milestone_done ? "✓ Done" : "○ Pending"}</span>
                  <span>Mini-project: {currentWeekProg?.mini_project_done ? "✓ Done" : "○ Pending"}</span>
                  <span>Move-on: {currentWeekProg?.move_on_passed ? "✓ Passed" : "○ Pending"}</span>
                </div>
              </div>

              <Link
                href={`/weeks/${currentWeekMeta.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-mono text-xs font-medium uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shrink-0 self-start sm:self-auto"
              >
                Open Week {currentWeekMeta.id}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Quick Log Form + 8-Week Hours Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quick-Log Form (Left Column, 7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <h2 className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
                    Log Today&apos;s Session
                  </h2>
                </div>
                <span className="font-mono text-[11px] text-stone-500">
                  {formatDateKey(new Date())}
                </span>
              </div>

              {logSuccessMessage && (
                <div className="p-2.5 rounded bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-center gap-2 text-xs font-mono text-teal-800 dark:text-teal-300">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{logSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleQuickLog} className="space-y-4">
                {/* Minutes + Quick Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="minutes"
                      className="text-xs font-mono font-medium text-stone-700 dark:text-stone-300"
                    >
                      Duration (Minutes)
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[30, 45, 60, 90, 120].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setMinutes(preset)}
                          className={`text-[11px] font-mono px-1.5 py-0.5 rounded border ${
                            minutes === preset
                              ? "bg-teal-700 text-white border-teal-700 font-semibold"
                              : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                          }`}
                        >
                          {preset}m
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    id="minutes"
                    type="number"
                    min={5}
                    max={600}
                    required
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                {/* Focus Phase */}
                <div>
                  <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Focus Phase
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {STUDY_FOCUS_CONFIG.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setFocus(opt.key)}
                        className={`p-2 text-xs font-mono rounded border text-center transition-all ${
                          focus === opt.key
                            ? "border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-semibold"
                            : "border-stone-200 dark:border-stone-700 hover:border-stone-400 text-stone-700 dark:text-stone-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Week */}
                <div>
                  <label
                    htmlFor="week-select"
                    className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1"
                  >
                    Associated Week (Optional)
                  </label>
                  <select
                    id="week-select"
                    value={selectedWeekId}
                    onChange={(e) =>
                      setSelectedWeekId(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    <option value="">No specific week</option>
                    {STATIC_WEEKS.map((w) => (
                      <option key={w.id} value={w.id}>
                        Week {w.id}: {w.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Note */}
                <div>
                  <label
                    htmlFor="session-notes"
                    className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1"
                  >
                    Session Notes (Optional)
                  </label>
                  <input
                    id="session-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Debugged LangGraph recursion loop, read Anthropic tool guide..."
                    className="w-full px-3 py-2 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmittingLog}
                  className="w-full py-2.5 px-4 rounded bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-mono text-xs font-medium uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmittingLog ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Log Session
                </button>
              </form>
            </div>

            {/* 8-Week Hours Bar Chart (Right Column, 5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 mb-4">
                  <h2 className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
                    Last 8 Weeks
                  </h2>
                  <span className="font-mono text-[11px] text-stone-500">
                    Target: 7–10h / week
                  </span>
                </div>

                {/* Light CSS Bar Chart */}
                <div className="h-44 flex items-end justify-between gap-1.5 pt-4 pb-2">
                  {eightWeeksBars.map((bar, i) => {
                    const heightPercent = Math.min(100, Math.round((bar.hours / maxBarHours) * 100));
                    const isTargetReached = bar.hours >= 7;

                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative"
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-stone-100 text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                          {bar.hours.toFixed(1)}h ({bar.minutes}m)
                        </div>

                        {/* Numeric label above bar if > 0 */}
                        {bar.hours > 0 && (
                          <span className="text-[10px] font-mono text-stone-500 mb-1">
                            {bar.hours >= 1 ? bar.hours.toFixed(0) : bar.hours.toFixed(1)}
                          </span>
                        )}

                        {/* Bar Body */}
                        <div
                          className={`w-full max-w-[28px] rounded-t transition-all duration-300 ${
                            bar.isCurrentWeek
                              ? isTargetReached
                                ? "bg-teal-700 dark:bg-teal-400"
                                : "bg-teal-600/70 dark:bg-teal-500/70"
                              : isTargetReached
                              ? "bg-stone-600 dark:bg-stone-400"
                              : "bg-stone-300 dark:bg-stone-700"
                          }`}
                          style={{ height: `${Math.max(4, heightPercent)}%` }}
                        />

                        {/* Week Label */}
                        <span
                          className={`text-[9px] font-mono mt-2 truncate w-full text-center ${
                            bar.isCurrentWeek
                              ? "font-bold text-teal-700 dark:text-teal-400"
                              : "text-stone-400"
                          }`}
                        >
                          {bar.weekLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart Legend / Target Guideline note */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-[11px] font-mono text-stone-500 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-teal-700 dark:bg-teal-400 inline-block" />
                  Current week
                </span>
                <Link
                  href="/log"
                  className="text-stone-600 dark:text-stone-400 hover:text-teal-700 dark:hover:text-teal-400 flex items-center gap-1"
                >
                  View full logs &rarr;
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
