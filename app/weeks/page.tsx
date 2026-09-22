"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { STATIC_WEEKS } from "@/lib/data/curriculum";
import { Week, WeekProgress } from "@/lib/types";
import { ArrowRight, Check, Circle, Loader2 } from "lucide-react";

export default function WeeksPage() {
  const [weeks, setWeeks] = useState<Week[]>(STATIC_WEEKS);
  const [progressMap, setProgressMap] = useState<Record<number, WeekProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const [weeksRes, progressRes] = await Promise.all([
          supabase.from("weeks").select("*").order("id"),
          supabase.from("week_progress").select("*"),
        ]);

        if (weeksRes.data && weeksRes.data.length > 0) {
          setWeeks(weeksRes.data as Week[]);
        }

        if (progressRes.data) {
          const map: Record<number, WeekProgress> = {};
          progressRes.data.forEach((p) => {
            map[p.week_id] = p as WeekProgress;
          });
          setProgressMap(map);
        }
      } catch (err) {
        console.warn("Using local curriculum fallback", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalMilestonesDone = Object.values(progressMap).filter((p) => p.milestone_done).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stone-300 dark:border-stone-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              12-Week Track
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5">
              Weekly Curriculum & Milestones
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-mono mt-1">
              Check off milestone, mini-project, and move-on checks with evidence notes.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3 py-1.5 rounded self-start sm:self-auto">
            <span>Milestones:</span>
            <strong className="text-teal-700 dark:text-teal-400 font-semibold">
              {totalMilestonesDone} / 12
            </strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-stone-500 font-mono text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-teal-700 dark:text-teal-400" />
          <span>Loading 12-week curriculum...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {weeks.map((week) => {
            const prog = progressMap[week.id];
            const checksCount = [
              prog?.milestone_done,
              prog?.mini_project_done,
              prog?.move_on_passed,
            ].filter(Boolean).length;

            const isAllDone = checksCount === 3;

            return (
              <Link
                key={week.id}
                href={`/weeks/${week.id}`}
                className={`p-4 rounded-lg border transition-all group ${
                  isAllDone
                    ? "border-teal-300 dark:border-teal-900/60 bg-teal-50/20 dark:bg-teal-950/10"
                    : "border-stone-200 dark:border-stone-800/80 bg-white dark:bg-stone-900/40 hover:border-stone-400 dark:hover:border-stone-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                    Week {week.id < 10 ? `0${week.id}` : week.id}
                  </span>
                  <span className="font-mono text-[11px] text-stone-500">
                    {checksCount}/3 checks
                  </span>
                </div>

                <h2 className="font-mono font-semibold text-sm text-stone-900 dark:text-stone-100 mt-2 line-clamp-1 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  {week.title}
                </h2>

                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">
                  {week.goal}
                </p>

                {/* 3 Checks Indicator Badges */}
                <div className="mt-3.5 pt-3 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        prog?.milestone_done
                          ? "text-teal-700 dark:text-teal-400 font-medium"
                          : "text-stone-400 dark:text-stone-600"
                      }`}
                      title="Milestone"
                    >
                      {prog?.milestone_done ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Circle className="w-2.5 h-2.5" />
                      )}
                      Milestone
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 ${
                        prog?.mini_project_done
                          ? "text-teal-700 dark:text-teal-400 font-medium"
                          : "text-stone-400 dark:text-stone-600"
                      }`}
                      title="Mini-project"
                    >
                      {prog?.mini_project_done ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Circle className="w-2.5 h-2.5" />
                      )}
                      Project
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 ${
                        prog?.move_on_passed
                          ? "text-teal-700 dark:text-teal-400 font-medium"
                          : "text-stone-400 dark:text-stone-600"
                      }`}
                      title="Move-on check"
                    >
                      {prog?.move_on_passed ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Circle className="w-2.5 h-2.5" />
                      )}
                      Move-on
                    </span>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
