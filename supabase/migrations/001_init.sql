-- 001_init.sql
-- Curriculum tables (static content, seeded once)

create table if not exists weeks (
  id int primary key,            -- 1..12
  title text not null,
  goal text not null,
  mini_project text,
  move_on_check text,
  resources jsonb not null default '[]'   -- [{label, url}]
);

create table if not exists starter_sessions (
  id int primary key,            -- 1..14
  focus text not null,
  resource text not null
);

create table if not exists projects (
  id int primary key,            -- 1..11
  name text not null,
  week int references weeks(id),
  description text not null
);

-- Per-user progress tables (all with RLS)

create table if not exists week_progress (
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

create table if not exists session_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id int not null references starter_sessions(id),
  done boolean not null default false,
  done_at timestamptz,
  notes text,
  primary key (user_id, session_id)
);

create table if not exists project_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id int not null references projects(id),
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','done')),
  repo_url text,
  readme_checklist jsonb not null default '{}',  -- {item_key: bool}
  notes text,
  updated_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create table if not exists study_logs (
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

create index if not exists study_logs_user_date on study_logs (user_id, log_date desc);

-- Enable Row Level Security
alter table weeks enable row level security;
alter table starter_sessions enable row level security;
alter table projects enable row level security;

alter table week_progress enable row level security;
alter table session_progress enable row level security;
alter table project_progress enable row level security;
alter table study_logs enable row level security;

-- Curriculum tables: Read-only for authenticated users
drop policy if exists "Authenticated users can read weeks" on weeks;
create policy "Authenticated users can read weeks"
  on weeks for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read starter_sessions" on starter_sessions;
create policy "Authenticated users can read starter_sessions"
  on starter_sessions for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read projects" on projects;
create policy "Authenticated users can read projects"
  on projects for select
  to authenticated
  using (true);

-- Progress tables: User can only select/insert/update/delete their own rows
drop policy if exists "Users can select own week_progress" on week_progress;
create policy "Users can select own week_progress"
  on week_progress for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can insert own week_progress" on week_progress;
create policy "Users can insert own week_progress"
  on week_progress for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update own week_progress" on week_progress;
create policy "Users can update own week_progress"
  on week_progress for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own week_progress" on week_progress;
create policy "Users can delete own week_progress"
  on week_progress for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can select own session_progress" on session_progress;
create policy "Users can select own session_progress"
  on session_progress for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can insert own session_progress" on session_progress;
create policy "Users can insert own session_progress"
  on session_progress for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update own session_progress" on session_progress;
create policy "Users can update own session_progress"
  on session_progress for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own session_progress" on session_progress;
create policy "Users can delete own session_progress"
  on session_progress for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can select own project_progress" on project_progress;
create policy "Users can select own project_progress"
  on project_progress for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can insert own project_progress" on project_progress;
create policy "Users can insert own project_progress"
  on project_progress for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update own project_progress" on project_progress;
create policy "Users can update own project_progress"
  on project_progress for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own project_progress" on project_progress;
create policy "Users can delete own project_progress"
  on project_progress for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can select own study_logs" on study_logs;
create policy "Users can select own study_logs"
  on study_logs for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can insert own study_logs" on study_logs;
create policy "Users can insert own study_logs"
  on study_logs for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update own study_logs" on study_logs;
create policy "Users can update own study_logs"
  on study_logs for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own study_logs" on study_logs;
create policy "Users can delete own study_logs"
  on study_logs for delete
  to authenticated
  using (user_id = auth.uid());
