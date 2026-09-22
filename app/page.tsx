import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, CheckSquare, Layers } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-mono tracking-tight text-stone-900 dark:text-stone-100">
          Curriculum Overview
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 font-mono mt-1">
          12-Week Agentic AI Zero-Budget Self-Study Logbook
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/weeks"
          className="p-5 rounded-lg border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-teal-700 dark:hover:border-teal-500 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-teal-700 dark:text-teal-400 font-semibold uppercase tracking-wider">
              <CalendarDays className="w-3.5 h-3.5" />
              12 Weeks
            </span>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors" />
          </div>
          <h2 className="text-lg font-semibold font-mono text-stone-900 dark:text-stone-100 mt-2">
            Weekly Milestones & Projects
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Track weekly milestones, mini-projects, move-on checks, and evidence notes.
          </p>
        </Link>

        <Link
          href="/sessions"
          className="p-5 rounded-lg border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-teal-700 dark:hover:border-teal-500 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-teal-700 dark:text-teal-400 font-semibold uppercase tracking-wider">
              <CheckSquare className="w-3.5 h-3.5" />
              14 Sessions
            </span>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors" />
          </div>
          <h2 className="text-lg font-semibold font-mono text-stone-900 dark:text-stone-100 mt-2">
            Starter Study Sessions
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Core foundations checklist across Python, HTTP, LLMs, and tool calling.
          </p>
        </Link>

        <Link
          href="/projects"
          className="p-5 rounded-lg border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-teal-700 dark:hover:border-teal-500 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-teal-700 dark:text-teal-400 font-semibold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              11 Projects
            </span>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors" />
          </div>
          <h2 className="text-lg font-semibold font-mono text-stone-900 dark:text-stone-100 mt-2">
            Project Ladder & README Checklist
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Progress through the ladder with GitHub repo links and 7-point README checks.
          </p>
        </Link>

        <Link
          href="/log"
          className="p-5 rounded-lg border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-teal-700 dark:hover:border-teal-500 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-teal-700 dark:text-teal-400 font-semibold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Daily Logs
            </span>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors" />
          </div>
          <h2 className="text-lg font-semibold font-mono text-stone-900 dark:text-stone-100 mt-2">
            Study History & Quick Log
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Record study minutes, focus areas, and view your study history.
          </p>
        </Link>
      </div>
    </div>
  );
}
