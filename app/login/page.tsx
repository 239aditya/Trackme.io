"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Lock, Mail, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Failed to sign in. Please verify your credentials.");
        setLoading(false);
        return;
      }

      router.push(nextUrl);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-lg border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-mono text-sm font-bold mb-3">
          AI
        </div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-stone-900 dark:text-stone-100">
          trackme<span className="text-teal-700 dark:text-teal-400">.io</span>
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-1">
          Agentic AI Learning Logbook
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-300 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="curator@self-study.dev"
              className="w-full pl-9 pr-3 py-2 text-sm font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-sm font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-mono text-xs font-medium uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 text-center">
        <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
          Single-user curriculum tracker. Account is provisioned via Supabase Auth.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center py-10 px-4">
      <Suspense fallback={<div className="font-mono text-xs text-stone-500">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
