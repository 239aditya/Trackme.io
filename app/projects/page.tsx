"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { STATIC_PROJECTS } from "@/lib/data/curriculum";
import {
  Project,
  ProjectProgress,
  ProjectStatus,
  ReadmeChecklistKey,
  README_CHECKLIST_CONFIG,
} from "@/lib/types";
import {
  ChevronDown,
  ChevronUp,
  GitBranch,
  Check,
  Save,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(STATIC_PROJECTS);
  const [progressMap, setProgressMap] = useState<Record<number, ProjectProgress>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(1); // first project open by default
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

        const [projectsRes, progressRes] = await Promise.all([
          supabase.from("projects").select("*").order("id"),
          supabase.from("project_progress").select("*"),
        ]);

        if (projectsRes.data && projectsRes.data.length > 0) {
          setProjects(projectsRes.data as Project[]);
        }

        if (progressRes.data) {
          const map: Record<number, ProjectProgress> = {};
          progressRes.data.forEach((p) => {
            map[p.project_id] = p as ProjectProgress;
          });
          setProgressMap(map);
        }
      } catch (err) {
        console.warn("Using local projects fallback", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const saveProjectProgress = useCallback(
    async (projectId: number, updates: Partial<ProjectProgress>) => {
      if (!userId) return;
      setSaveStatus("saving");

      try {
        const supabase = createClient();
        const existing = progressMap[projectId] || {
          user_id: userId,
          project_id: projectId,
          status: "not_started" as ProjectStatus,
          repo_url: "",
          readme_checklist: {},
          notes: "",
          updated_at: new Date().toISOString(),
        };

        const payload: ProjectProgress = {
          ...existing,
          ...updates,
          user_id: userId,
          project_id: projectId,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("project_progress")
          .upsert(payload, { onConflict: "user_id,project_id" });

        if (error) {
          console.error("Failed to save project progress", error.message);
          setSaveStatus("unsaved");
        } else {
          setProgressMap((prev) => ({
            ...prev,
            [projectId]: payload,
          }));
          setSaveStatus("saved");
        }
      } catch (err) {
        console.error("Error saving project", err);
        setSaveStatus("unsaved");
      }
    },
    [userId, progressMap]
  );

  const handleStatusChange = (projectId: number, status: ProjectStatus) => {
    setProgressMap((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || {
          user_id: userId || "",
          project_id: projectId,
          repo_url: "",
          readme_checklist: {},
          notes: "",
          updated_at: new Date().toISOString(),
        }),
        status,
      },
    }));

    saveProjectProgress(projectId, { status });
  };

  const handleReadmeChecklistToggle = (projectId: number, itemKey: ReadmeChecklistKey) => {
    const current = progressMap[projectId]?.readme_checklist || {};
    const nextChecklist = {
      ...current,
      [itemKey]: !current[itemKey],
    };

    setProgressMap((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || {
          user_id: userId || "",
          project_id: projectId,
          status: "not_started",
          repo_url: "",
          notes: "",
          updated_at: new Date().toISOString(),
        }),
        readme_checklist: nextChecklist,
      },
    }));

    saveProjectProgress(projectId, { readme_checklist: nextChecklist });
  };

  const handleRepoUrlChange = (projectId: number, url: string) => {
    setSaveStatus("unsaved");
    setProgressMap((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || {
          user_id: userId || "",
          project_id: projectId,
          status: "not_started",
          readme_checklist: {},
          notes: "",
          updated_at: new Date().toISOString(),
        }),
        repo_url: url,
      },
    }));

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveProjectProgress(projectId, { repo_url: url });
    }, 700);
  };

  const handleNotesChange = (projectId: number, notes: string) => {
    setSaveStatus("unsaved");
    setProgressMap((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || {
          user_id: userId || "",
          project_id: projectId,
          status: "not_started",
          repo_url: "",
          readme_checklist: {},
          updated_at: new Date().toISOString(),
        }),
        notes,
      },
    }));

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveProjectProgress(projectId, { notes });
    }, 700);
  };

  const completedCount = Object.values(progressMap).filter((p) => p.status === "done").length;
  const inProgressCount = Object.values(progressMap).filter(
    (p) => p.status === "in_progress"
  ).length;

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="border-b border-stone-300 dark:border-stone-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              Project Ladder
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5">
              11-Project Autonomous Ladder
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-mono mt-1">
              Hands-on implementations. Each project includes a 7-point README verification standard.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-teal-800 dark:text-teal-300 font-semibold">
              {completedCount} / {projects.length} shipped
            </span>
            {inProgressCount > 0 && (
              <span className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                {inProgressCount} in progress
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Save indicator */}
      <div className="flex justify-end font-mono text-xs">
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

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-stone-500 font-mono text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-teal-700 dark:text-teal-400" />
          <span>Loading project ladder...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const prog = progressMap[project.id];
            const status = prog?.status || "not_started";
            const checklist = prog?.readme_checklist || {};
            const checkedCount = README_CHECKLIST_CONFIG.filter((c) => checklist[c.key]).length;
            const isExpanded = expandedId === project.id;

            return (
              <div
                key={project.id}
                className={`rounded-lg border transition-all ${
                  status === "done"
                    ? "border-teal-300 dark:border-teal-900/60 bg-teal-50/15 dark:bg-teal-950/10"
                    : status === "in_progress"
                    ? "border-amber-300 dark:border-amber-900/60 bg-white dark:bg-stone-900/60"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60"
                }`}
              >
                {/* Accordion Summary Bar */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : project.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      P{project.id < 10 ? `0${project.id}` : project.id}
                    </span>
                    <div>
                      <h2 className="font-mono text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {project.name}
                      </h2>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                        {project.week ? `Week ${project.week} • ` : ""}
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Pill */}
                    <span
                      className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded ${
                        status === "done"
                          ? "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300"
                          : status === "in_progress"
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                      }`}
                    >
                      {status === "done"
                        ? "Done"
                        : status === "in_progress"
                        ? "In Progress"
                        : "Not Started"}
                    </span>

                    {/* README Check Pill */}
                    <span className="hidden sm:inline font-mono text-[11px] text-stone-500">
                      {checkedCount}/7 README checks
                    </span>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Form */}
                {isExpanded && (
                  <div className="p-5 border-t border-stone-200 dark:border-stone-800/80 bg-stone-50/30 dark:bg-stone-900/30 space-y-5">
                    {/* Controls Row: Status & Repo URL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Status Selector */}
                      <div>
                        <label
                          htmlFor={`status-${project.id}`}
                          className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1"
                        >
                          Ladder Status
                        </label>
                        <select
                          id={`status-${project.id}`}
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(project.id, e.target.value as ProjectStatus)
                          }
                          className="w-full px-3 py-2 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-teal-700"
                        >
                          <option value="not_started">Not started</option>
                          <option value="in_progress">In progress</option>
                          <option value="done">Done (Shipped)</option>
                        </select>
                      </div>

                      {/* GitHub Repo URL */}
                      <div>
                        <label
                          htmlFor={`repo-${project.id}`}
                          className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1"
                        >
                          GitHub Repository URL
                        </label>
                        <div className="relative">
                          <GitBranch className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id={`repo-${project.id}`}
                            type="url"
                            value={prog?.repo_url || ""}
                            onChange={(e) => handleRepoUrlChange(project.id, e.target.value)}
                            placeholder="https://github.com/your-username/repo-name"
                            className="w-full pl-9 pr-8 py-2 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
                          />
                          {prog?.repo_url && (
                            <a
                              href={prog.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-teal-700 dark:hover:text-teal-400"
                              title="Open repository"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 7-Item README Checklist */}
                    <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                          7-Item README Verification Standard
                        </span>
                        <span className="font-mono text-xs text-teal-700 dark:text-teal-400 font-medium">
                          {checkedCount} of 7 checked
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {README_CHECKLIST_CONFIG.map((item) => {
                          const isChecked = !!checklist[item.key];
                          return (
                            <div
                              key={item.key}
                              onClick={() =>
                                handleReadmeChecklistToggle(project.id, item.key)
                              }
                              className={`p-2.5 rounded border cursor-pointer select-none flex items-center gap-2.5 transition-all ${
                                isChecked
                                  ? "border-teal-300 dark:border-teal-900 bg-teal-50/30 dark:bg-teal-950/20"
                                  : "border-stone-200 dark:border-stone-800 hover:border-stone-300"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                  isChecked
                                    ? "bg-teal-700 border-teal-700 text-white"
                                    : "border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800"
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3" />}
                              </div>
                              <span className="text-xs font-mono text-stone-800 dark:text-stone-200">
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Project Notes */}
                    <div>
                      <label
                        htmlFor={`notes-${project.id}`}
                        className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1"
                      >
                        Project Notes, Architecture Notes & Eval Results
                      </label>
                      <textarea
                        id={`notes-${project.id}`}
                        rows={3}
                        value={prog?.notes || ""}
                        onChange={(e) => handleNotesChange(project.id, e.target.value)}
                        placeholder="Key design choices, test evaluations, failure modes discovered..."
                        className="w-full p-2.5 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
