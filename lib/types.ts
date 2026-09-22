// lib/types.ts

export interface ResourceLink {
  label: string;
  url: string;
}

export interface Week {
  id: number;
  title: string;
  goal: string;
  mini_project: string | null;
  move_on_check: string | null;
  resources: ResourceLink[];
}

export interface StarterSession {
  id: number;
  focus: string;
  resource: string;
}

export interface Project {
  id: number;
  name: string;
  week: number | null;
  description: string;
}

export interface WeekProgress {
  user_id: string;
  week_id: number;
  milestone_done: boolean;
  mini_project_done: boolean;
  move_on_passed: boolean;
  evidence: string | null;
  notes: string | null;
  updated_at: string;
}

export interface SessionProgress {
  user_id: string;
  session_id: number;
  done: boolean;
  done_at: string | null;
  notes: string | null;
}

export type ProjectStatus = "not_started" | "in_progress" | "done";

export type ReadmeChecklistKey =
  | "problem_statement"
  | "architecture_diagram"
  | "tools_list"
  | "example_io"
  | "failure_modes"
  | "evaluation_method"
  | "runs_free_locally";

export interface ProjectProgress {
  user_id: string;
  project_id: number;
  status: ProjectStatus;
  repo_url: string | null;
  readme_checklist: Partial<Record<ReadmeChecklistKey, boolean>>;
  notes: string | null;
  updated_at: string;
}

export type StudyFocus = "theory" | "reproduction" | "build" | "explain_test";

export interface StudyLog {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  minutes: number;
  focus: StudyFocus;
  week_id: number | null;
  notes: string | null;
  created_at: string;
}

export const README_CHECKLIST_CONFIG: { key: ReadmeChecklistKey; label: string }[] = [
  { key: "problem_statement", label: "Problem statement and intended user" },
  { key: "architecture_diagram", label: "Architecture diagram" },
  { key: "tools_list", label: "Tools available to the agent" },
  { key: "example_io", label: "Example input and output" },
  { key: "failure_modes", label: "Known failure modes" },
  { key: "evaluation_method", label: "Evaluation method and test cases" },
  { key: "runs_free_locally", label: "Runs locally without paid services" },
];

export const STUDY_FOCUS_CONFIG: { key: StudyFocus; label: string }[] = [
  { key: "theory", label: "Theory" },
  { key: "reproduction", label: "Reproduction" },
  { key: "build", label: "Build" },
  { key: "explain_test", label: "Explain & Test" },
];
