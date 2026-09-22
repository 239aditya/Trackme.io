"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { STATIC_STARTER_SESSIONS } from "@/lib/data/curriculum";
import { StarterSession, SessionProgress } from "@/lib/types";
import { Check, Loader2, MessageSquare, Save } from "lucide-react";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<StarterSession[]>(STATIC_STARTER_SESSIONS);
  const [progressMap, setProgressMap] = useState<Record<number, SessionProgress>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeNoteSessionId, setActiveNoteSessionId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
        }

        const [sessionsRes, progressRes] = await Promise.all([
          supabase.from("starter_sessions").select("*").order("id"),
          supabase.from("session_progress").select("*"),
        ]);

        if (sessionsRes.data && sessionsRes.data.length > 0) {
          setSessions(sessionsRes.data as StarterSession[]);
        }

        if (progressRes.data) {
          const map: Record<number, SessionProgress> = {};
          progressRes.data.forEach((p) => {
            map[p.session_id] = p as SessionProgress;
          });
          setProgressMap(map);
        }
      } catch (err) {
        console.warn("Using local sessions fallback", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const saveSessionProgress = useCallback(
    async (sessionId: number, updates: Partial<SessionProgress>) => {
      if (!userId) return;
      setSaveStatus("saving");

      try {
        const supabase = createClient();
        const existing = progressMap[sessionId] || {
          user_id: userId,
          session_id: sessionId,
          done: false,
          done_at: null,
          notes: "",
        };

        const payload: SessionProgress = {
          ...existing,
          ...updates,
          user_id: userId,
          session_id: sessionId,
        };

        const { error } = await supabase
          .from("session_progress")
          .upsert(payload, { onConflict: "user_id,session_id" });

        if (error) {
          console.error("Failed to save session progress", error.message);
          setSaveStatus("unsaved");
        } else {
          setProgressMap((prev) => ({
            ...prev,
            [sessionId]: payload,
          }));
          setSaveStatus("saved");
        }
      } catch (err) {
        console.error("Error saving session", err);
        setSaveStatus("unsaved");
      }
    },
    [userId, progressMap]
  );

  const toggleSession = (session: StarterSession) => {
    const current = progressMap[session.id]?.done || false;
    const nextDone = !current;
    const doneAt = nextDone ? new Date().toISOString() : null;

    // Optimistic update
    setProgressMap((prev) => ({
      ...prev,
      [session.id]: {
        ...(prev[session.id] || { user_id: userId || "", session_id: session.id, notes: null }),
        done: nextDone,
        done_at: doneAt,
      },
    }));

    saveSessionProgress(session.id, {
      done: nextDone,
      done_at: doneAt,
    });
  };

  const handleNotesChange = (sessionId: number, text: string) => {
    setSaveStatus("unsaved");
    // Update local state immediately
    setProgressMap((prev) => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || {
          user_id: userId || "",
          session_id: sessionId,
          done: false,
          done_at: null,
        }),
        notes: text,
      },
    }));

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveSessionProgress(sessionId, { notes: text });
    }, 700);
  };

  const doneCount = Object.values(progressMap).filter((p) => p.done).length;
  const percentage = Math.round((doneCount / sessions.length) * 100) || 0;

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header with Stats */}
      <div className="border-b border-stone-300 dark:border-stone-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              Phase 0 Foundations
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5">
              14 Starter Study Sessions
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-mono mt-1">
              Complete these 14 focused study sessions before embarking on deeper agent workflows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                {doneCount} of {sessions.length} done
              </div>
              <div className="text-[11px] text-teal-700 dark:text-teal-400">
                {percentage}% complete
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden mt-4">
          <div
            className="bg-teal-700 dark:bg-teal-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Save indicator */}
      <div className="flex justify-end font-mono text-xs">
        {saveStatus === "saving" && (
          <span className="inline-flex items-center gap-1 text-stone-500">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving notes...
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400">
            <Save className="w-3 h-3" /> Saved
          </span>
        )}
        {saveStatus === "unsaved" && (
          <span className="text-amber-600 dark:text-amber-400">Unsaved changes</span>
        )}
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-stone-500 font-mono text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-teal-700 dark:text-teal-400" />
          <span>Loading starter sessions...</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sessions.map((session) => {
            const prog = progressMap[session.id];
            const isDone = prog?.done || false;
            const isExpanded = activeNoteSessionId === session.id;

            return (
              <div
                key={session.id}
                className={`rounded-lg border transition-all ${
                  isDone
                    ? "border-teal-300 dark:border-teal-900/60 bg-teal-50/20 dark:bg-teal-950/10"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-stone-300"
                }`}
              >
                <div className="p-4 flex items-start gap-3.5">
                  {/* Custom Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSession(session)}
                    aria-label={`Mark session ${session.id} as ${isDone ? "incomplete" : "complete"}`}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
                      isDone
                        ? "bg-teal-700 border-teal-700 text-white"
                        : "border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 hover:border-teal-600"
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {/* Session Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        Session {session.id < 10 ? `0${session.id}` : session.id}
                      </span>
                      {prog?.done_at && (
                        <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400">
                          Completed {new Date(prog.done_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h2
                      className={`text-sm font-mono mt-1 ${
                        isDone
                          ? "line-through text-stone-500 dark:text-stone-400"
                          : "text-stone-900 dark:text-stone-100 font-medium"
                      }`}
                    >
                      {session.focus}
                    </h2>

                    <div className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1.5">
                      <span>Resource:</span>
                      <span className="text-stone-700 dark:text-stone-300 italic">
                        {session.resource}
                      </span>
                    </div>

                    {/* Collapsible note trigger or preview */}
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveNoteSessionId(isExpanded ? null : session.id)
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-600 dark:text-stone-400 hover:text-teal-700 dark:hover:text-teal-400"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {prog?.notes ? "Edit session note" : "Add note"}
                      </button>

                      {prog?.notes && !isExpanded && (
                        <span className="text-[11px] font-mono text-stone-500 truncate max-w-xs sm:max-w-md">
                          &ldquo;{prog.notes}&rdquo;
                        </span>
                      )}
                    </div>

                    {/* Inline Note Editor */}
                    {isExpanded && (
                      <div className="mt-3 pt-2 border-t border-stone-200 dark:border-stone-800">
                        <textarea
                          rows={2}
                          value={prog?.notes || ""}
                          onChange={(e) => handleNotesChange(session.id, e.target.value)}
                          placeholder="Add brief takeaway, gotchas, or exercise link..."
                          className="w-full p-2.5 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
