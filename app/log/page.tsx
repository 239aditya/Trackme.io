"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { STATIC_WEEKS } from "@/lib/data/curriculum";
import { StudyLog, StudyFocus, STUDY_FOCUS_CONFIG } from "@/lib/types";
import { formatDateKey } from "@/lib/utils/stats";
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  ArrowLeft,
  X,
  Check,
  BookOpen,
} from "lucide-react";

export default function StudyLogPage() {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Modal / Form state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState<string>(formatDateKey(new Date()));
  const [formMinutes, setFormMinutes] = useState<number>(60);
  const [formFocus, setFormFocus] = useState<StudyFocus>("build");
  const [formWeekId, setFormWeekId] = useState<number | "">(1);
  const [formNotes, setFormNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
        }

        const { data } = await supabase
          .from("study_logs")
          .select("*")
          .order("log_date", { ascending: false })
          .order("created_at", { ascending: false });

        if (data) {
          setLogs(data as StudyLog[]);
        }
      } catch (err) {
        console.warn("Could not fetch study logs", err);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  const openAddModal = () => {
    setEditingLogId(null);
    setFormDate(formatDateKey(new Date()));
    setFormMinutes(60);
    setFormFocus("build");
    setFormWeekId(1);
    setFormNotes("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (log: StudyLog) => {
    setEditingLogId(log.id);
    setFormDate(log.log_date.substring(0, 10));
    setFormMinutes(log.minutes);
    setFormFocus(log.focus);
    setFormWeekId(log.week_id || "");
    setFormNotes(log.notes || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formMinutes < 5 || formMinutes > 600) {
      setFormError("Minutes must be between 5 and 600.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      user_id: userId || "local-user",
      log_date: formDate,
      minutes: Number(formMinutes),
      focus: formFocus,
      week_id: formWeekId === "" ? null : Number(formWeekId),
      notes: formNotes.trim() || null,
    };

    try {
      const supabase = createClient();

      if (editingLogId) {
        // Update existing log
        if (userId) {
          const { error } = await supabase
            .from("study_logs")
            .update(payload)
            .eq("id", editingLogId);

          if (error) throw error;
        }

        setLogs((prev) =>
          prev.map((l) =>
            l.id === editingLogId
              ? {
                  ...l,
                  ...payload,
                }
              : l
          )
        );
      } else {
        // Insert new log
        const tempId = `temp-${Date.now()}`;
        const newLog: StudyLog = {
          id: tempId,
          ...payload,
          created_at: new Date().toISOString(),
        };

        setLogs((prev) => [newLog, ...prev]);

        if (userId) {
          const { data, error } = await supabase
            .from("study_logs")
            .insert(payload)
            .select()
            .single();

          if (error) throw error;
          if (data) {
            setLogs((prev) =>
              prev.map((l) => (l.id === tempId ? (data as StudyLog) : l))
            );
          }
        }
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save study log.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this study log entry?")) return;

    setDeletingId(id);
    const previous = [...logs];
    setLogs((prev) => prev.filter((l) => l.id !== id));

    try {
      if (userId) {
        const supabase = createClient();
        const { error } = await supabase.from("study_logs").delete().eq("id", id);
        if (error) {
          setLogs(previous);
          alert("Failed to delete log from database: " + error.message);
        }
      }
    } catch {
      setLogs(previous);
      alert("Error deleting study log.");
    } finally {
      setDeletingId(null);
    }
  };

  // Group logs by month: "September 2026", "August 2026", etc.
  const groupedLogs: Record<string, StudyLog[]> = {};
  for (const log of logs) {
    const [year, month] = log.log_date.substring(0, 10).split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    const groupKey = d.toLocaleString("en-US", { month: "long", year: "numeric" });
    if (!groupedLogs[groupKey]) {
      groupedLogs[groupKey] = [];
    }
    groupedLogs[groupKey].push(log);
  }

  const totalMinutes = logs.reduce((sum, l) => sum + l.minutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Header */}
      <div className="border-b border-stone-300 dark:border-stone-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                Study History
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
              Study Log &amp; Time Archive
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-mono mt-0.5">
              Every study session logged across the 12-week curriculum.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="font-mono text-xs text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3 py-1.5 rounded">
              <span>Total Invested: </span>
              <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                {totalHours.toFixed(1)}h ({totalMinutes}m)
              </strong>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-mono text-xs font-medium uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Log
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-stone-500 font-mono text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-teal-700 dark:text-teal-400" />
          <span>Loading study log history...</span>
        </div>
      ) : logs.length === 0 ? (
        /* Actionable Empty State */
        <div className="py-16 px-6 text-center rounded-lg border border-dashed border-stone-300 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-mono text-base font-semibold text-stone-800 dark:text-stone-200">
              No study sessions logged yet
            </h2>
            <p className="font-mono text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1">
              Log your first session today to record your time, preserve notes, and ignite your study streak.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-teal-700 text-white font-mono text-xs font-medium uppercase tracking-wider hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Log First Session
          </button>
        </div>
      ) : (
        /* Grouped Log History */
        <div className="space-y-8">
          {Object.entries(groupedLogs).map(([monthYear, monthLogs]) => {
            const monthMinutes = monthLogs.reduce((s, l) => s + l.minutes, 0);
            const monthHours = Math.round((monthMinutes / 60) * 10) / 10;

            return (
              <div key={monthYear} className="space-y-3">
                {/* Month Group Header */}
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-1.5">
                  <h2 className="font-mono text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {monthYear}
                  </h2>
                  <span className="font-mono text-[11px] text-stone-500">
                    {monthLogs.length} sessions • {monthHours.toFixed(1)}h
                  </span>
                </div>

                {/* Month Entries */}
                <div className="space-y-2">
                  {monthLogs.map((log) => {
                    const weekMeta = log.week_id
                      ? STATIC_WEEKS.find((w) => w.id === log.week_id)
                      : null;

                    return (
                      <div
                        key={log.id}
                        className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-stone-300 dark:hover:border-stone-700 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Date Key */}
                            <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                              {log.log_date.substring(0, 10)}
                            </span>

                            {/* Minutes */}
                            <span className="inline-flex items-center gap-1 font-mono text-xs text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {log.minutes}m ({(log.minutes / 60).toFixed(1)}h)
                            </span>

                            {/* Focus Badge */}
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-900 font-medium capitalize">
                              {log.focus.replace("_", " & ")}
                            </span>

                            {/* Week Tag */}
                            {log.week_id && (
                              <Link
                                href={`/weeks/${log.week_id}`}
                                className="font-mono text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                              >
                                Week {log.week_id}: {weekMeta?.title}
                              </Link>
                            )}
                          </div>

                          {/* Notes */}
                          {log.notes && (
                            <p className="text-xs font-mono text-stone-600 dark:text-stone-300 pt-1 leading-relaxed">
                              &ldquo;{log.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => openEditModal(log)}
                            className="p-1.5 rounded text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            title="Edit log entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === log.id}
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1.5 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete log entry"
                          >
                            {deletingId === log.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-lg border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h2 className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
                {editingLogId ? "Edit Study Session" : "Log New Study Session"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-mono text-red-800 dark:text-red-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveLog} className="space-y-4">
              {/* Date */}
              <div>
                <label
                  htmlFor="modal-date"
                  className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1"
                >
                  Date
                </label>
                <input
                  id="modal-date"
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              {/* Minutes */}
              <div>
                <label
                  htmlFor="modal-minutes"
                  className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1"
                >
                  Minutes (5–600)
                </label>
                <input
                  id="modal-minutes"
                  type="number"
                  min={5}
                  max={600}
                  required
                  value={formMinutes}
                  onChange={(e) => setFormMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              {/* Focus Phase */}
              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Focus Phase
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STUDY_FOCUS_CONFIG.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setFormFocus(opt.key)}
                      className={`p-2 text-xs font-mono rounded border text-center transition-all ${
                        formFocus === opt.key
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
                  htmlFor="modal-week"
                  className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1"
                >
                  Associated Week (Optional)
                </label>
                <select
                  id="modal-week"
                  value={formWeekId}
                  onChange={(e) =>
                    setFormWeekId(e.target.value === "" ? "" : Number(e.target.value))
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

              {/* Notes */}
              <div>
                <label
                  htmlFor="modal-notes"
                  className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1"
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="modal-notes"
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="What did you study or build today?..."
                  className="w-full p-2.5 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-xs font-mono rounded text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-mono text-xs font-medium uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
