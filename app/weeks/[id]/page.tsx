"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { STATIC_WEEKS } from "@/lib/data/curriculum";
import { Week, WeekProgress } from "@/lib/types";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  BookOpen,
  FileCheck,
  Check,
  Save,
  Loader2,
} from "lucide-react";

export default function WeekDetailPage() {
  const params = useParams();
  const weekId = parseInt(params.id as string, 10);

  const [week, setWeek] = useState<Week | null>(
    STATIC_WEEKS.find((w) => w.id === weekId) || null
  );
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Progress state
  const [milestoneDone, setMilestoneDone] = useState(false);
  const [miniProjectDone, setMiniProjectDone] = useState(false);
  const [moveOnPassed, setMoveOnPassed] = useState(false);
  const [evidence, setEvidence] = useState("");
  const [notes, setNotes] = useState("");

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load week and progress
  useEffect(() => {
    async function loadWeekData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
        }

        // Fetch curriculum definition
        const { data: dbWeek } = await supabase
          .from("weeks")
          .select("*")
          .eq("id", weekId)
          .single();

        if (dbWeek) {
          setWeek(dbWeek as Week);
        }

        // Fetch progress
        if (user) {
          const { data: prog } = await supabase
            .from("week_progress")
            .select("*")
            .eq("week_id", weekId)
            .maybeSingle();

          if (prog) {
            const p = prog as WeekProgress;
            setMilestoneDone(p.milestone_done);
            setMiniProjectDone(p.mini_project_done);
            setMoveOnPassed(p.move_on_passed);
            setEvidence(p.evidence || "");
            setNotes(p.notes || "");
          }
        }
      } catch (err) {
        console.warn("Error loading week data", err);
      } finally {
        setLoading(false);
      }
    }

    if (weekId >= 1 && weekId <= 12) {
      loadWeekData();
    }
  }, [weekId]);

  // Persist progress helper
  const saveProgress = useCallback(
    async (updates: Partial<WeekProgress>) => {
      if (!userId) return;
      setSaveStatus("saving");

      try {
        const supabase = createClient();
        const payload = {
          user_id: userId,
          week_id: weekId,
          milestone_done: milestoneDone,
          mini_project_done: miniProjectDone,
          move_on_passed: moveOnPassed,
          evidence,
          notes,
          updated_at: new Date().toISOString(),
          ...updates,
        };

        const { error } = await supabase
          .from("week_progress")
          .upsert(payload, { onConflict: "user_id,week_id" });

        if (error) {
          console.error("Failed to save week progress:", error.message);
          setSaveStatus("unsaved");
        } else {
          setSaveStatus("saved");
        }
      } catch (err) {
        console.error("Error saving week progress:", err);
        setSaveStatus("unsaved");
      }
    },
    [userId, weekId, milestoneDone, miniProjectDone, moveOnPassed, evidence, notes]
  );

  // Optimistic toggle handlers
  const toggleMilestone = () => {
    const nextVal = !milestoneDone;
    setMilestoneDone(nextVal);
    saveProgress({ milestone_done: nextVal });
  };

  const toggleMiniProject = () => {
    const nextVal = !miniProjectDone;
    setMiniProjectDone(nextVal);
    saveProgress({ mini_project_done: nextVal });
  };

  const toggleMoveOn = () => {
    const nextVal = !moveOnPassed;
    setMoveOnPassed(nextVal);
    saveProgress({ move_on_passed: nextVal });
  };

  // Debounced autosave for textarea changes
  const handleEvidenceChange = (val: string) => {
    setEvidence(val);
    setSaveStatus("unsaved");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveProgress({ evidence: val });
    }, 750);
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    setSaveStatus("unsaved");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveProgress({ notes: val });
    }, 750);
  };

  if (weekId < 1 || weekId > 12 || (!week && !loading)) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="font-mono text-sm text-stone-500">Week not found.</p>
        <Link
          href="/weeks"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-teal-700 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to 12 Weeks
        </Link>
      </div>
    );
  }

  const checksCount = [milestoneDone, miniProjectDone, moveOnPassed].filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Top Bar Navigation & Autosave Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/weeks"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all weeks
        </Link>

        <div className="flex items-center gap-2 font-mono text-xs">
          {saveStatus === "saving" && (
            <span className="inline-flex items-center gap-1 text-stone-500">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
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
      </div>

      {/* Week Header */}
      <div className="p-6 rounded-lg border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-4 mb-4">
          <div>
            <span className="inline-block text-xs font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-teal-800 dark:text-teal-300 uppercase tracking-wider">
              Week {weekId < 10 ? `0${weekId}` : weekId} of 12
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-2">
              {week?.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-stone-600 dark:text-stone-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              7–10 h/week
            </span>
            <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold">
              {checksCount}/3 done
            </span>
          </div>
        </div>

        {/* Goal Description */}
        <div>
          <h2 className="text-xs font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            Weekly Goal
          </h2>
          <p className="text-sm font-mono text-stone-800 dark:text-stone-200 leading-relaxed">
            {week?.goal}
          </p>
        </div>
      </div>

      {/* Curated Resources */}
      {week?.resources && week.resources.length > 0 && (
        <div className="p-5 rounded-lg border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900">
          <h2 className="text-xs font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Curated Study Resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {week.resources.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded border border-stone-200 dark:border-stone-800 hover:border-teal-700 dark:hover:border-teal-500 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors group"
              >
                <span className="font-mono text-xs font-medium text-stone-800 dark:text-stone-200 group-hover:text-teal-700 dark:group-hover:text-teal-400">
                  {res.label}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-teal-700 dark:group-hover:text-teal-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* The 3 Core Toggles */}
      <div className="p-6 rounded-lg border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
        <h2 className="text-xs font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileCheck className="w-3.5 h-3.5" />
          Weekly Verification Checks
        </h2>

        {/* 1. Milestone Done */}
        <div
          onClick={toggleMilestone}
          className={`p-4 rounded-md border cursor-pointer select-none transition-all flex items-start gap-3.5 ${
            milestoneDone
              ? "border-teal-400 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-950/20"
              : "border-stone-200 dark:border-stone-800 hover:border-stone-400"
          }`}
        >
          <div
            className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
              milestoneDone
                ? "bg-teal-700 border-teal-700 text-white"
                : "border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800"
            }`}
          >
            {milestoneDone && <Check className="w-3.5 h-3.5" />}
          </div>
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
              Milestone completed
            </span>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {week?.goal}
            </p>
          </div>
        </div>

        {/* 2. Mini-Project Done */}
        <div
          onClick={toggleMiniProject}
          className={`p-4 rounded-md border cursor-pointer select-none transition-all flex items-start gap-3.5 ${
            miniProjectDone
              ? "border-teal-400 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-950/20"
              : "border-stone-200 dark:border-stone-800 hover:border-stone-400"
          }`}
        >
          <div
            className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
              miniProjectDone
                ? "bg-teal-700 border-teal-700 text-white"
                : "border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800"
            }`}
          >
            {miniProjectDone && <Check className="w-3.5 h-3.5" />}
          </div>
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
              Mini-project completed
            </span>
            <p className="text-xs font-mono text-stone-700 dark:text-stone-300 leading-relaxed">
              {week?.mini_project}
            </p>
          </div>
        </div>

        {/* 3. Move-On Check Passed */}
        <div
          onClick={toggleMoveOn}
          className={`p-4 rounded-md border cursor-pointer select-none transition-all flex items-start gap-3.5 ${
            moveOnPassed
              ? "border-teal-400 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-950/20"
              : "border-stone-200 dark:border-stone-800 hover:border-stone-400"
          }`}
        >
          <div
            className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
              moveOnPassed
                ? "bg-teal-700 border-teal-700 text-white"
                : "border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800"
            }`}
          >
            {moveOnPassed && <Check className="w-3.5 h-3.5" />}
          </div>
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
              Move-on check passed
            </span>
            <p className="text-xs font-mono text-stone-700 dark:text-stone-300 leading-relaxed">
              {week?.move_on_check}
            </p>
          </div>
        </div>
      </div>

      {/* Evidence & Notes Textareas (Autosaved) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Evidence */}
        <div className="p-5 rounded-lg border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2">
          <label
            htmlFor="evidence"
            className="block text-xs font-mono font-semibold text-stone-700 dark:text-stone-300"
          >
            Evidence Note
            <span className="block text-[11px] font-normal text-stone-500 dark:text-stone-400 mt-0.5">
              &quot;What proves I can do this?&quot; (code link, repo, summary)
            </span>
          </label>
          <textarea
            id="evidence"
            rows={5}
            value={evidence}
            onChange={(e) => handleEvidenceChange(e.target.value)}
            placeholder="e.g. Completed CLI toolbox at github.com/user/py-toolbox, verified all 5 terminal commands..."
            className="w-full p-3 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 leading-relaxed resize-y"
          />
        </div>

        {/* Free Notes */}
        <div className="p-5 rounded-lg border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2">
          <label
            htmlFor="notes"
            className="block text-xs font-mono font-semibold text-stone-700 dark:text-stone-300"
          >
            Study Notes & Discoveries
            <span className="block text-[11px] font-normal text-stone-500 dark:text-stone-400 mt-0.5">
              Reflections, gotchas, architecture diagrams, or insights
            </span>
          </label>
          <textarea
            id="notes"
            rows={5}
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="e.g. Note on tool-calling schemas: Pydantic schemas must declare strict docstrings for LLM parameter resolution..."
            className="w-full p-3 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 leading-relaxed resize-y"
          />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800 text-xs font-mono">
        {weekId > 1 ? (
          <Link
            href={`/weeks/${weekId - 1}`}
            className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-400 hover:text-teal-700 dark:hover:text-teal-400"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Week {weekId - 1}
          </Link>
        ) : (
          <div />
        )}

        {weekId < 12 ? (
          <Link
            href={`/weeks/${weekId + 1}`}
            className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-400 hover:text-teal-700 dark:hover:text-teal-400"
          >
            Week {weekId + 1} &rarr;
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
