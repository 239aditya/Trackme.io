# Trackme.io — Agentic AI Learning Tracker

A personal, single-user study logbook web application built to track progress through a 12-week "Agentic AI Zero-Budget" self-study curriculum. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase (Auth + Postgres RLS).

Designed with a calm "lab notebook" aesthetic, tactile checkboxes, debounced autosave, mobile responsiveness (~375px), and zero paid dependencies.

---

## 1. Features & Screens

- **Dashboard (`/`)**:
  - **Overall Progress**: Percentage of the 12 weekly milestones completed with active week indicator.
  - **Current Streak**: Consecutive calendar days with ≥1 study session (intact whether finished today or yesterday).
  - **Weekly Target**: Mon–Sun hours calculation against the 7–10 h target band with status indicators.
  - **Continue Card**: Direct link to the current active week's curriculum and checks.
  - **Quick-Log Form**: Instantly log minutes (with quick-select buttons), focus phase, optional week, and note with optimistic updates.
  - **8-Week Hours Bar Chart**: Lightweight CSS-driven bar visualization of the last 8 calendar weeks with tooltips and target guidelines.

- **12 Weeks (`/weeks` & `/weeks/[id]`)**:
  - **Index View**: 12 cards showing milestone, mini-project, and move-on checks status.
  - **Detail View**: Full weekly goal, 7–10h target, curated external study resource links (open in new tab).
  - **Verification Toggles**: Milestone done, Mini-project done (with description), and Move-on check passed (with criteria).
  - **Autosaving Textareas**: Debounced saving for Evidence notes ("what proves I can do this") and free-form study notes to Supabase.

- **Starter Sessions (`/sessions`)**:
  - The 14 fundamental sessions as an ordered checklist.
  - Ticking records timestamp (`done_at`), preserves optional inline notes, and displays an animated "X of 14 done" progress bar.

- **11-Project Ladder (`/projects`)**:
  - Vertical ladder from Python Toolbox (Week 1) to dual Capstones (Week 12).
  - Status selector: *Not started*, *In progress*, *Done*.
  - GitHub repository URL field with direct external link.
  - **7-Item README Checklist**: Interactive checkboxes for `problem_statement`, `architecture_diagram`, `tools_list`, `example_io`, `failure_modes`, `evaluation_method`, and `runs_free_locally`.
  - Architecture and evaluation notes field.

- **Study Log Archive (`/log`)**:
  - Reverse-chronological history of all logged study sessions.
  - Automatic grouping by month (e.g., September 2026).
  - Full modal dialog to add new entries or edit existing logs (date, minutes, focus, week, note).
  - Delete log entry with confirmation dialog.
  - Actionable empty state inviting the first log.

- **Authentication (`/login`)**:
  - Supabase email + password authentication.
  - No public sign-up UI (single-user model provisioned via Supabase).
  - Next.js middleware protecting all application routes.

---

## 2. Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (lab notebook palette: warm paper `#fbf9f5`, neutral ink, single teal `#0f766e` progress accent)
- **Database & Auth**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`) with Row Level Security (RLS) policies
- **Icons**: Lucide React
- **Unit Testing**: Vitest (pure stats utilities for streak and Mon–Sun weekly window calculations)
- **Deployment**: Vercel (Hobby plan)

---

## 3. Getting Started Locally

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd Trackme.io
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Migrations & Seed Data
Follow the instructions in [SETUP.md](SETUP.md) to initialize your Supabase tables and curriculum seed data.

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Testing & Verification

Run the automated Vitest suite:
```bash
npm test
```
All 20 unit tests verify streak edge cases (empty logs, log today, log yesterday, gaps, duplicates, date formats) and Mon–Sun weekly hour window aggregation.

Run the production build:
```bash
npm run build
```

---

## 5. Deployment

For complete, step-by-step instructions on deploying the database and hosting the app on Vercel, please read **[SETUP.md](SETUP.md)**.
