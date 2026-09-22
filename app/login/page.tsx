export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm p-6 border border-stone-300 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-900 shadow-sm">
        <div className="text-center mb-6">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-mono text-sm font-bold mb-2">
            AI
          </span>
          <h1 className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
            trackme.io
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-1">
            Personal Agentic AI Study Tracker
          </p>
        </div>
        <div className="text-xs text-stone-500 font-mono text-center">
          Sign-in form will be implemented in Phase 2.
        </div>
      </div>
    </div>
  );
}
