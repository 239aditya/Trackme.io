# PLANNER.md — Agentic AI Learning Tracker

> **Instructions for the coding agent (Codex):** Build this project by working through the phases in Section 8, in order. Complete each phase fully — including its acceptance criteria — before starting the next. Make one git commit per phase with a clear message. Do not skip the seed data in Section 5; it is the actual content of the app. Never hardcode secrets; use environment variables and provide a `.env.example`. When something requires a human action (creating the Supabase project, setting Vercel env vars), write it into `SETUP.md` instead of attempting it yourself.

---

## 1. What we are building

A personal, single-user web app that tracks progress through a 12-week "Agentic AI Zero-Budget" self-study curriculum. The owner studies 1–2 hours/day and wants to:

1. See overall progress at a glance (weeks done, current streak, hours this week).
2. Open each of the 12 weeks and check off its milestone, mini-project, and move-on check, with an "evidence" note.
3. Tick off the 14 starter study sessions.
4. Track the 11-project ladder (status, GitHub repo link, README checklist per project).
5. Log daily study sessions (date, minutes, focus phase, notes) and see streaks + weekly hours vs. the 7–10 h target.
6. Have all data **persist across devices** — stored in Supabase, not localStorage.

The app is deployed on **Vercel** (Hobby/free) with **Supabase** (free tier) for auth + Postgres. Nothing in this project may require a paid service — that is the whole spirit of the curriculum.

---

## 2. Tech stack (fixed — do not substitute)

- **Next.js 14+ (App Router) + TypeScript**
- **Tailwind CSS** for styling
- **Supabase**: Postgres + Auth (`@supabase/supabase-js` + `@supabase/ssr` for cookie-based auth in the App Router)
- **No ORM required** — plain Supabase client queries are fine; keep dependencies minimal
- Charts: keep it light. A simple bar for "hours per week" may be built with plain divs/CSS or one small dependency at most. No heavy chart library.
- Deployment target: Vercel. No custom server, no Docker.

---

## 3. Data model

Provide a SQL migration file at `supabase/migrations/001_init.sql` containing everything below, and a `supabase/seed.sql` with the seed data from Section 5.

### Curriculum tables (static content, seeded once)

```sql
create table weeks (
  id int primary key,            -- 1..12
  title text not null,
  goal text not null,
  mini_project text,
  move_on_check text,
  resources jsonb not null default '[]'   -- [{label, url}]
);

create table starter_sessions (
  id int primary key,            -- 1..14
  focus text not null,
  resource text not null
);

create table projects (
  id int primary key,            -- 1..11
  name text not null,
  week int references weeks(id),
  description text not null
);
```

### Per-user progress tables (all with RLS)

```sql
create table week_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_id int not null references weeks(id),
  milestone_done boolean not null default false,
  mini_project_done boolean not null default false,
  move_on_passed boolean not null default false,
  evidence text,
  notes text,
  updated_at timestamptz not null default now(),
  primary key (user_id, week_id)
);

create table session_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id int not null references starter_sessions(id),
  done boolean not null default false,
  done_at timestamptz,
  notes text,
  primary key (user_id, session_id)
);

create table project_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id int not null references projects(id),
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','done')),
  repo_url text,
  readme_checklist jsonb not null default '{}',  -- {item_key: bool}, keys in Section 5.4
  notes text,
  updated_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create table study_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  minutes int not null check (minutes between 5 and 600),
  focus text not null
    check (focus in ('theory','reproduction','build','explain_test')),
  week_id int references weeks(id),
  notes text,
  created_at timestamptz not null default now()
);
create index study_logs_user_date on study_logs (user_id, log_date desc);
```

### Row Level Security

- Enable RLS on all four progress tables. Policy: users can `select/insert/update/delete` only rows where `user_id = auth.uid()`.
- Curriculum tables (`weeks`, `starter_sessions`, `projects`): enable RLS with a read-only policy for authenticated users; no insert/update from the client.

---

## 4. Pages & features

All pages behind auth except `/login`.

### `/login`
Supabase email + password sign-in. No public sign-up UI (the single account is created manually — covered in SETUP.md). Clean, minimal, one form.

### `/` — Dashboard
- Overall progress: % of the 12 weekly milestones done, shown as a progress bar with "Week X of 12" (current week = first week whose milestone isn't done).
- Current study streak (consecutive calendar days with at least one study log, ending today or yesterday).
- Hours this week (Mon–Sun sum of `study_logs.minutes`) vs. the 7–10 h target, with a subtle indicator when inside the band.
- Last 8 weeks of study hours as a small bar chart.
- "Log today's session" quick form: minutes, focus (theory / reproduction / build / explain & test), optional week, optional note. One submit, optimistic update.
- A "continue" card linking to the current week's detail page.

### `/weeks` and `/weeks/[id]`
- Index: 12 rows/cards, each showing week number, title, and which of its three checks are done.
- Detail page for each week:
  - Goal and time target (7–10 h/week for every week).
  - Resource links (open in new tab).
  - Three toggles: **Milestone done**, **Mini-project done**, **Move-on check passed**, with the mini-project and move-on text displayed next to their toggles.
  - Evidence textarea ("what proves I can do this") and a free notes textarea, autosaved (debounced) to `week_progress`.

### `/sessions`
The 14 starter sessions as an ordered checklist. Ticking one records `done_at`. Optional short note per session. Show "X of 14 done".

### `/projects`
The 11-project ladder as a vertical list in order. Each project expands to show:
- Status selector (Not started / In progress / Done).
- GitHub repo URL field.
- The 7-item README checklist (Section 5.4) as checkboxes stored in `readme_checklist` jsonb.
- Notes field.

### `/log`
Full study history: reverse-chronological list of study logs (date, minutes, focus, week, note), editable/deletable. Simple month grouping is enough — no calendar heatmap required in v1.

### Behaviors
- Every write is per-user via RLS; use upserts for the progress tables.
- Empty states must invite action ("No sessions logged yet — log your first one above"), never be blank.
- The app must be fully usable on a phone (this user will check off items from mobile).

---

## 5. Seed data (put verbatim into `supabase/seed.sql`)

### 5.1 Weeks

| id | title | goal | mini_project | move_on_check |
|---|---|---|---|---|
| 1 | Python for Agent Builders | Read, modify, and debug the Python used by agent examples. | Toolbox CLI: five functions (calculator, read_text_file, count_words, save_json, load_json) called from a menu-driven terminal program. | Explain a dictionary, JSON-like object, function argument, exception, import, and file path without looking them up. |
| 2 | HTTP, JSON, APIs, and Small Web Services | Understand how a Python program talks to the outside world. | Script that calls one public API, converts the response to a dict, saves clean JSON, prints a summary — then wrap it in a tiny FastAPI endpoint. | Send a request, inspect the response, identify an error status, store a key in an env var, and explain JSON to a beginner. |
| 3 | LLM Application Foundations | Move from "I use ChatGPT" to "I can build an LLM-powered program." | Paper exercise: one user request designed three ways — plain prompt, single-API-call app, agentic workflow — with the differences written down. | Explain the difference between a chatbot, an LLM application, a workflow, and an agent without buzzwords. |
| 4 | Structured Outputs and Tool Calling | Teach a model to produce machine-usable decisions and tool calls. | Three tools: calculator, search-local-file, simple database lookup. Model/tool interaction only — no agent yet. | Describe the 6-step tool-calling flow: schema → model → tool call → validate/execute → result back → next step or answer. |
| 5 | Build an Agent Loop From Scratch | Understand the core control loop without any framework. | Research Assistant v1: goal → tool calls → results → final answer over local files, with logging and a max-turn limit. | Explain why the application, not the model, executes tools — and show your own working loop. |
| 6 | State, Memory, Embeddings, and RAG | Give the agent access to information beyond the current turn. | Personal Knowledge Agent: index a folder of notes into a local Chroma store, retrieve top matches, answer with snippets attached. | Draw the retrieval path: documents → chunk/index → query → embedding/search → retrieved context → model → answer. |
| 7 | Planning, Workflows, and Agentic Patterns | Know when to use a deterministic workflow, a single agent, or a multi-step pattern. | Competitor research workflow diagram: every box marked deterministic, LLM decision, or tool execution. | Answer "what is the smallest amount of autonomy needed?" for a given task and justify it. |
| 8 | LangGraph — Framework After Fundamentals | Translate the manual agent ideas into an explicit stateful graph. | Research Agent v2: planner, research, evaluator, and finalizer nodes with explicit state. | Point to every part of the graph and explain why it exists. |
| 9 | Multi-Agent Systems | Learn delegation without multi-agent hype. | Marketing Research Team: coordinator plus Researcher, Analyst, Reviewer specialists, each kept narrow. | Explain manager/specialist, handoffs, agents-as-tools, and shared vs isolated context. |
| 10 | MCP — Model Context Protocol | Understand how tools/data are exposed through a standard protocol. | MCP Toolbox Server: expose list-files, read-file, and search-text; connect one compatible client. | Explain the progression: function → tool → tool collection → external tool server → MCP client/server. |
| 11 | Reliability, Evaluation, Guardrails, and Testing | Make agents dependable systems, not impressive demos. | Evaluation set of 20 tasks for the Research Agent; record pass/fail and failure reasons; change the system once and rerun. | Show repeatable tests covering failure paths, step limits, and guardrail checks. |
| 12 | Capstones + Freelance Transition | Turn the skills into portfolio pieces that solve business problems. | Capstone A: Marketing Research & Content Agent. Capstone B: narrow Repository Review Agent with tests and controlled writes. | Ship one client-style system with README, demo, evaluation set, and stated limitations. |

### 5.2 Week resources (`resources` jsonb per week)

- **Week 1:** Python Tutorial — https://docs.python.org/3/tutorial/ · CS50P — https://cs50.harvard.edu/python/ · Exercism Python — https://exercism.org/tracks/python
- **Week 2:** MDN HTTP Overview — https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview · FastAPI Tutorial — https://fastapi.tiangolo.com/tutorial/ · Pro Git — https://git-scm.com/book/en/v2
- **Week 3:** HF LLM Course — https://huggingface.co/learn/llm-course/chapter0/1 · HF Agents Course Unit 0 — https://huggingface.co/learn/agents-course/unit0/introduction · HF Agents Unit 1 — https://huggingface.co/learn/agents-course/unit1/introduction · Anthropic: Building Effective Agents — https://www.anthropic.com/engineering/building-effective-agents
- **Week 4:** OpenAI Function Calling — https://developers.openai.com/api/docs/guides/function-calling · OpenAI Structured Outputs — https://developers.openai.com/api/docs/guides/structured-outputs · Gemini Function Calling — https://ai.google.dev/gemini-api/docs/function-calling · Pydantic Models — https://docs.pydantic.dev/latest/concepts/models/ · Microsoft AI Agents for Beginners — https://github.com/microsoft/ai-agents-for-beginners
- **Week 5:** HF Agents Unit 1 — https://huggingface.co/learn/agents-course/unit1/introduction · Gemini Function Calling — https://ai.google.dev/gemini-api/docs/function-calling · Microsoft AI Agents for Beginners — https://github.com/microsoft/ai-agents-for-beginners
- **Week 6:** LlamaIndex RAG — https://docs.llamaindex.ai/en/stable/understanding/rag/ · Sentence Transformers semantic search — https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html · Chroma Getting Started — https://docs.trychroma.com/docs/overview/getting-started · LangChain Learn — https://docs.langchain.com/oss/python/learn
- **Week 7:** Anthropic: Building Effective Agents — https://www.anthropic.com/engineering/building-effective-agents · Microsoft Study Guide — https://github.com/microsoft/ai-agents-for-beginners/blob/main/STUDY_GUIDE.md
- **Week 8:** LangGraph Overview — https://docs.langchain.com/oss/python/langgraph/overview · LangChain Learn — https://docs.langchain.com/oss/python/learn
- **Week 9:** OpenAI Agents SDK — https://openai.github.io/openai-agents-python/ · LangGraph Overview — https://docs.langchain.com/oss/python/langgraph/overview · HF Agents Course — https://huggingface.co/learn/agents-course/unit0/introduction
- **Week 10:** MCP Introduction — https://modelcontextprotocol.io/introduction · MCP Python SDK — https://py.sdk.modelcontextprotocol.io/get-started/
- **Week 11:** OpenAI Agents SDK — https://openai.github.io/openai-agents-python/ · Microsoft Study Guide — https://github.com/microsoft/ai-agents-for-beginners/blob/main/STUDY_GUIDE.md · Google ADK Quickstart — https://adk.dev/get-started/quickstart/ · pytest — https://docs.pytest.org/en/stable/getting-started.html
- **Week 12:** Anthropic: Building Effective Agents — https://www.anthropic.com/engineering/building-effective-agents · Microsoft Study Guide — https://github.com/microsoft/ai-agents-for-beginners/blob/main/STUDY_GUIDE.md

### 5.3 Starter sessions (id, focus, resource)

1. Python: functions + dictionaries — Python official tutorial
2. Python: files + exceptions — Python official tutorial
3. Git basics — Pro Git, chapters 1–2 (selected)
4. HTTP request/response — MDN HTTP overview
5. JSON + API call — MDN + a simple public API
6. LLM application mental model — HF LLM Course intro + HF Agents Unit 1 intro
7. Agent definitions + use cases — HF Agents Unit 1
8. Tools and tool schemas — OpenAI Function Calling + Google Function Calling
9. Structured output — OpenAI Structured Outputs + Pydantic
10. Build first tool call — Your own Python tool + a free model
11. Tool result loop — Google function calling / HF Agents examples
12. Manual agent loop — Your own implementation, no framework
13. Failure handling + max steps — pytest + your logs
14. Mini project demo + README — GitHub repository, screenshot, explanation

### 5.4 Projects (id, name, week, description) and README checklist

1. Python Toolbox — week 1 — Functions, JSON, files, exceptions. Goal: confidence.
2. API Data Reporter — week 2 — Call an API, normalize JSON, produce a report.
3. Three-Tool LLM App — week 4 — Model selects among calculator/file/database tools.
4. Agent Loop from Scratch — week 5 — Goal → tool calls → tool results → final output.
5. Personal Knowledge Agent — week 6 — Retrieval + context + answer.
6. Research Workflow — week 7 — Planner/evaluator pattern with explicit boundaries.
7. LangGraph Research Agent — week 8 — Explicit state graph with loops and evaluation.
8. Marketing Agent Team — week 9 — Researcher + analyst + reviewer.
9. MCP Toolbox — week 10 — Expose local tools through MCP.
10. Marketing Capstone — week 12 — Client-style competitor/content research automation.
11. Coding Capstone — week 12 — Narrow repository review agent with tests and controlled write operations.

README checklist keys (same 7 for every project): `problem_statement`, `architecture_diagram`, `tools_list`, `example_io`, `failure_modes`, `evaluation_method`, `runs_free_locally`. Display labels: "Problem statement and intended user", "Architecture diagram", "Tools available to the agent", "Example input and output", "Known failure modes", "Evaluation method and test cases", "Runs locally without paid services".

---

## 6. Streak & stats rules

- **Streak:** consecutive days with ≥1 study log. The chain may end today *or yesterday* (logging in the evening shouldn't show a broken streak in the morning). Compute server-side or in a shared util with unit tests.
- **Hours this week:** sum of minutes for the current Mon–Sun window, displayed as `X.Xh / 7–10h target`.
- **Overall progress:** count of weeks with `milestone_done = true`, out of 12.
- **Current week:** lowest week id whose `milestone_done` is false; if all done, show a "curriculum complete" state.

---

## 7. Design direction

This is a personal study logbook, not a SaaS product. Aim for a calm "lab notebook" feel:

- One typeface family (or one display + one body at most), a restrained palette with a **single** accent color used only for progress and completed states — pick something specific, not a default template look.
- Checkboxes/toggles are the core interaction: make ticking something feel satisfying (a small state-change transition is fine; no scroll animations, no decorative gradients, no identical rounded-card grids for everything).
- Numbered structure is genuinely meaningful here (weeks 1–12, sessions 1–14, projects 1–11), so lean on clear numbering and progress indicators rather than decoration.
- Light and dark mode via `prefers-color-scheme` is a nice-to-have, not required.
- Quality floor: responsive to ~375 px, visible keyboard focus, respects reduced motion, accessible contrast.

---

## 8. Build phases (work in this order)

### Phase 0 — Scaffold
Next.js + TypeScript + Tailwind app, ESLint, `.env.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, base layout with nav (Dashboard, Weeks, Sessions, Projects, Log).
**Done when:** `npm run dev` shows the shell with working navigation; `npm run build` passes.

### Phase 1 — Database
Write `supabase/migrations/001_init.sql` (schema + RLS from Section 3) and `supabase/seed.sql` (Section 5, complete and verbatim). Add typed row definitions in `lib/types.ts` and a Supabase client factory (`lib/supabase/server.ts`, `lib/supabase/client.ts` using `@supabase/ssr`).
**Done when:** both SQL files run cleanly on a fresh Supabase project; seed inserts 12 weeks, 14 sessions, 11 projects.

### Phase 2 — Auth
Login page, middleware protecting all routes except `/login`, sign-out. No sign-up UI.
**Done when:** unauthenticated visits redirect to `/login`; a Supabase-created user can log in and out.

### Phase 3 — Weeks, Sessions, Projects
The three tracking surfaces from Section 4, reading curriculum tables and upserting progress tables. Debounced autosave for text fields; optimistic toggle updates.
**Done when:** every toggle, field, and checklist persists, survives reload, and is scoped to the logged-in user.

### Phase 4 — Study log & dashboard
Quick-log form, `/log` history with edit/delete, dashboard stats per Section 6 including the 8-week hours bar. Unit-test the streak and week-window utilities.
**Done when:** logging a session updates streak/hours immediately; streak tests pass for edge cases (no logs, gap days, log yesterday only).

### Phase 5 — Polish
Apply Section 7, empty states, mobile pass at 375 px, loading/error states for every data fetch.
**Done when:** no blank screens, no layout breakage on mobile, `npm run build` clean.

### Phase 6 — Docs & deploy readiness
Write `README.md` (what/stack/screens) and `SETUP.md` with exact human steps:
1. Create a free Supabase project; run `001_init.sql` then `seed.sql` in the SQL editor.
2. In Supabase Auth settings, create the single user (email + password) manually; optionally disable public sign-ups.
3. Copy the project URL and anon key into `.env.local` locally and into Vercel → Project → Environment Variables.
4. Import the GitHub repo into Vercel (Hobby plan) and deploy; no build settings changes needed.
5. Verify: log in on the deployed URL, tick Week 1's first item, refresh, confirm it stuck — then open it on a phone and confirm the same.

**Done when:** a person following SETUP.md alone gets a working deployed site.

---

## 9. Out of scope for v1 (do not build)

Multi-user support beyond RLS, social features, notifications/emails, calendar heatmaps, AI features inside the tracker, file uploads, offline mode, and any paid service or API. Keep it small, fast, and free.
