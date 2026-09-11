# Developer Command Center

A polished full-stack dashboard for developers — one place for your GitHub repositories, contribution stats, recent commits, pull requests, issues, and a personal task list.

> **Status:** 🚧 Under active construction. This README currently contains the detailed implementation plan (Phase 1). It will be finalized in Phase 7 with screenshots, setup, architecture, and deployment instructions.

---

## Implementation Plan

### Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Server components + route handlers |
| Styling | Tailwind CSS v4 + shadcn/ui | Design system with dark/light mode |
| Auth & DB | Supabase (`@supabase/ssr`) | GitHub OAuth, Postgres for tasks |
| GitHub data | GitHub REST API v3 | Proxied via Next.js route handlers |
| Testing | Vitest | Unit tests for utility functions |
| Deployment | Vercel | Env vars managed in Vercel dashboard |

### Phases

1. **Implementation plan (this document)** — commit the plan before writing code.
2. **Scaffold & design system** — Next.js app, TypeScript strict mode, Tailwind, shadcn/ui primitives (button, card, badge, dropdown, dialog, skeleton, tabs, etc.), `next-themes` dark/light mode with system preference + toggle, responsive app shell (sidebar on desktop, sheet on mobile).
3. **UI with mock data** — Build every screen against a typed `DataProvider` interface backed by mock data:
   - Dashboard: repository cards, contribution heatmap + streak stats, recent commits feed, open pull requests, open issues.
   - Tasks: personal task list with status (todo / in-progress / done), priority (low / medium / high / urgent), due date, filter + sort.
   - Loading skeletons, empty states, and error states for every data surface.
4. **Supabase** — GitHub OAuth sign-in flow, middleware-based session refresh, `tasks` table with Row Level Security (users can only read/write their own rows), task CRUD moves to Supabase (mock provider retained for offline/demo mode).
5. **GitHub API integration** — Route handlers under `/api/github/*` that call the GitHub REST API using the user's OAuth access token, with `next/cache` revalidation, rate-limit handling, and typed responses mapped to the UI models.
6. **Tests** — Vitest unit tests for pure utilities: date/relative-time formatting, task sorting & filtering, contribution streak calculation, priority ordering.
7. **Final README** — screenshots placeholders, local setup, environment variable reference, architecture overview, Vercel deployment steps.

### Target data model

```
Task      { id, user_id, title, notes?, status: 'todo'|'in_progress'|'done',
            priority: 'low'|'medium'|'high'|'urgent', due_date?, repo?, created_at, updated_at }

RepoCard  { id, name, fullName, description, language, stars, forks, isPrivate, updatedAt, openIssues, openPRs? }
Commit    { sha, message, author, avatarUrl?, repo, date }
PullReq   { id, title, repo, author, avatarUrl?, state, createdAt, additions?, deletions? }
Issue     { id, title, repo, number, author, state, createdAt, labels[] }
Contribs  { total, byDay: { date, count }[], longestStreak, currentStreak }
```

### Environment variables (never committed)

```
NEXT_PUBLIC_SUPABASE_URL=        # public Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # public anon key (safe for browser, RLS enforced)
```

The GitHub OAuth access token is obtained via Supabase auth (provider token in the session) and is **only** used server-side inside route handlers — it never reaches the client bundle. `.env.local` is git-ignored; `.env.example` documents the shape.
