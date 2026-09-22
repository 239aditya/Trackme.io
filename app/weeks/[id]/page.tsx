import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function WeekDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <Link
        href="/weeks"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to all weeks
      </Link>
      <div className="border-b border-stone-300 dark:border-stone-800 pb-4">
        <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
          Week {params.id}
        </span>
        <h1 className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
          Week {params.id} Curriculum Details
        </h1>
      </div>
      <p className="text-sm font-mono text-stone-600 dark:text-stone-400">
        Curriculum milestone, mini-project, move-on criteria, and notes will be loaded here.
      </p>
    </div>
  );
}
