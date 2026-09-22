# SETUP.md — Production Setup & Deployment Guide

This guide details the exact human steps required to set up your Supabase backend and deploy the **Trackme.io** app to Vercel for free.

---

## Step 1: Create Supabase Project & Initialize Database

1. Go to [database.new](https://database.new) and sign in or create a free [Supabase](https://supabase.com) account.
2. Click **New Project**:
   - **Name**: `trackme-io` (or any name you prefer)
   - **Database Password**: Set a secure password and save it in your password manager.
   - **Pricing Plan**: Free (0$/month).
   - Click **Create new project** and wait ~2 minutes for the database to provision.
3. Open the **SQL Editor** from the left navigation bar.
4. Open the file `supabase/migrations/001_init.sql` in this repo:
   - Copy its entire contents, paste it into the Supabase SQL Editor, and click **Run**.
   - Verify success: 7 tables (`weeks`, `starter_sessions`, `projects`, `week_progress`, `session_progress`, `project_progress`, `study_logs`) are created with Row Level Security (RLS) enabled.
5. In a new SQL query tab, open `supabase/seed.sql` in this repo:
   - Copy its entire contents, paste it into the Supabase SQL Editor, and click **Run**.
   - Verify success: 12 weeks, 14 starter study sessions, and 11 ladder projects are seeded into the database.

---

## Step 2: Create User & Configure Auth Settings

1. In your Supabase dashboard, click **Authentication** in the left navigation sidebar.
2. Go to **Users** and click **Add user** &rarr; **Create user**:
   - **User Email**: Enter your personal email (e.g. `curator@self-study.dev`).
   - **User Password**: Enter a strong password.
   - **Auto Confirm User?**: Check this box so no email confirmation is required.
   - Click **Create user**.
3. (Recommended) Go to **Authentication** &rarr; **Providers** &rarr; **Email**:
   - Ensure "Enable Email provider" is turned ON.
   - You can toggle OFF "Confirm email" if you don't want confirmation links.
4. (Optional Security) In **Authentication** &rarr; **Sign Up**, disable public sign-ups so only the account you created can access the app.

---

## Step 3: Configure Environment Variables

1. In your Supabase dashboard, navigate to **Project Settings** (gear icon) &rarr; **API**.
2. Locate the following two values under **Project API keys**:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
3. For local development, create or update `.env.local` in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
4. Test locally:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`, log in with your Supabase email and password, and confirm you reach the dashboard.

---

## Step 4: Deploy to Vercel (Hobby Free Tier)

1. Push this repository to your GitHub account (public or private):
   ```bash
   git remote add origin https://github.com/<your-username>/trackme.io.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **Add New...** &rarr; **Project**.
4. Select your `trackme.io` repository and click **Import**.
5. In the project configuration:
   - **Framework Preset**: Next.js (detected automatically).
   - **Root Directory**: `./` (default).
   - **Build Command**: `next build` (default).
   - **Output Directory**: `.next` (default).
6. Under **Environment Variables**, add the two variables:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`, Value: your Supabase Project URL.
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Value: your Supabase Anon Key.
7. Click **Deploy**. Vercel will build and deploy the app in ~60 seconds.

---

## Step 5: Verification & Mobile Pass

1. **Desktop Verification**:
   - Open your deployed Vercel URL (e.g. `https://trackme-io.vercel.app`).
   - Unauthenticated visits automatically redirect to `/login`.
   - Log in using your email and password.
   - Go to **Weeks** &rarr; **Week 01**.
   - Check the **Milestone completed** toggle.
   - Enter an evidence note: `"Verified CLI toolbox working with 5 commands"`.
   - Refresh the browser (`F5`).
   - Confirm the milestone checkbox remains checked, evidence text is preserved, and Dashboard shows **1 / 12 milestones**.
2. **Log & Streak Verification**:
   - Go to Dashboard, click **Log Session** with 60 minutes of "Build".
   - Confirm streak increments to `1 day` and hours this week reflects `1.0h`.
   - Visit `/log` and confirm your entry appears under the current month.
3. **Mobile Verification**:
   - Open the deployed URL on your smartphone or shrink your desktop browser to ~375px.
   - Test the mobile menu drawer.
   - Check an item in **Sessions** (e.g. Session 01) and expand a project in **Projects** to ensure no horizontal layout breakage occurs.

---

## Zero-Budget Guarantee

This entire stack operates completely within the free tiers:
- **Supabase Free Tier**: 500 MB database, 50,000 monthly active users, daily backups.
- **Vercel Hobby Plan**: Unlimited personal deployments, global edge network, automated SSL certificates.
- **No Paid APIs or Frameworks**: Plain `@supabase/supabase-js`, zero subscription requirements.
