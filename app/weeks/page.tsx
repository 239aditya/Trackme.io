import Link from "next/link";

export default function WeeksPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-300 dark:border-stone-800 pb-4">
        <h1 className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
          12-Week Curriculum
        </h1>
        <p className="text-xs text-stone-600 dark:text-stone-400 font-mono mt-1">
          Weekly goals, mini-projects, move-on checks, and evidence notes
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((weekNum) => (
          <Link
            key={weekNum}
            href={`/weeks/${weekNum}`}
            className="p-4 rounded border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-teal-700 dark:hover:border-teal-500 transition-colors"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-teal-700 dark:text-teal-400">Week {weekNum}</span>
              <span className="text-stone-500">7–10 h target</span>
            </div>
            <h3 className="font-mono text-sm font-medium mt-1 text-stone-900 dark:text-stone-100">
              Week {weekNum} Curriculum Detail
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
