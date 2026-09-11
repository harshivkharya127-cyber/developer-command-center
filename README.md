# Developer Command Center

One polished dashboard for your development work: GitHub repositories, contribution stats, recent commits, open pull requests, and issues — plus a personal task list with status, priority, and due dates.

![Dashboard](docs/screenshots/dashboard.png)

> 📸 *Screenshot placeholder — see `docs/screenshots/README.md` for the capture checklist.*

## Features

- **GitHub sign-in** — OAuth via Supabase; your access token stays server-side and is never exposed to the browser.
- **Dashboard** — stat cards (repos, stars, forks, open PRs/issues, tasks due), a GitHub-style contribution heatmap with streak stats, recent commits feed, open pull requests, and open issues.
- **Personal task list** — create, complete, re-prioritize, and delete tasks with status (`To Do / In Progress / Done`), priority (`Low → Urgent`), due dates with overdue highlighting, search, and filtering — stored in Postgres and protected by Row Level Security.
- **Dark / light mode** — system-aware theme with a manual toggle, no flash on load.
- **Responsive modern UI** — shadcn/ui design system; sidebar on desktop, sheet navigation on mobile.
- **Loading, empty, and error states** — every data surface has skeleton loaders, friendly empty states, and actionable error messages (including GitHub rate-limit handling).
- **Graceful degradation** — runs out of the box on realistic demo (mock) data; live data activates automatically as you configure Supabase and sign in.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router) + TypeScript (strict) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) |
| Auth & database | [Supabase](https://supabase.com) (GitHub OAuth + Postgres with RLS) |
| GitHub data | GitHub REST API v3 + GraphQL (server-side only) |
| Icons | [lucide-react](https://lucide.dev) |
| Testing | [Vitest](https://vitest.dev) |
| Deployment | Vercel |

## Screenshots

| Screen | Placeholder |
| --- | --- |
| Dashboard | `docs/screenshots/dashboard.png` |
| Contribution heatmap (dark) | `docs/screenshots/contributions-dark.png` |
| Task list | `docs/screenshots/tasks.png` |
| Pull requests | `docs/screenshots/pull-requests.png` |
| Issues | `docs/screenshots/issues.png` |
| Commits | `docs/screenshots/commits.png` |
| GitHub sign-in | `docs/screenshots/auth.png` |

*(Placeholders intentionally not committed yet — drop your captures at these paths and they will render here.)*

## Architecture

```text
┌────────────────────────────────────────────────────────────────┐
│  Browser                                                       │
│  ├── Server Components  ← serverDataProvider (per request)     │
│  │     ├── GitHubApiProvider   (repos/commits/PRs/issues)      │
│  │     └── ServerSupabaseTaskProvider (tasks, identity)        │
│  ├── Client Components  ← clientDataProvider                   │
│  │     └── BrowserSupabaseTaskProvider (task CRUD, RLS)        │
│  └── ThemeProvider (dark/light) + Proxy session refresh        │
└────────────────────────────────────────────────────────────────┘
        │ cookies (session)            │ HTTPS, token never client-side
        ▼                              ▼
┌──────────────────┐          ┌──────────────────────┐
│     Supabase     │          │      GitHub API      │
│  auth + Postgres │          │  REST v3 + GraphQL   │
│  tasks table,RLS │          │  5-min revalidation  │
└──────────────────┘          └──────────────────────┘
```

The entire UI talks to a single `DataProvider` interface (`src/lib/data-provider.ts`). Three implementations exist:

- **`MockDataProvider`** — realistic demo data; used when Supabase/GitHub aren't configured yet, so the app always runs.
- **`SupabaseTaskProvider`** (browser + server variants) — identity and task CRUD against Postgres; Row Level Security guarantees users only touch their own rows.
- **`GitHubApiProvider`** — live GitHub data (repos, push-event commits, PR search, issues, GraphQL contribution calendar), activated per request when an access token is available.

## Getting Started

### Prerequisites

- Node.js 20+ (tested on Node 24) and npm
- A [Supabase](https://supabase.com) project (free tier is fine)
- A GitHub account (for OAuth)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | for auth/tasks | Supabase project URL (Dashboard → Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for auth/tasks | Supabase public anon key — safe for the browser, RLS enforced |
| `GITHUB_TOKEN` | optional | Server-side personal access token for live GitHub data without signing in (scopes: `read:user` is enough) |

`.env.local` is git-ignored. The Supabase anon key is public by design; **never** put service-role or secret keys in these variables.

### 3. Set up Supabase

1. **Database** — open Dashboard → SQL Editor, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the `tasks` table, indexes, an `updated_at` trigger, and all Row Level Security policies.
2. **GitHub OAuth** — Dashboard → Authentication → Providers → GitHub → enable, and enter your GitHub OAuth app credentials:
   - Create a GitHub OAuth App (Settings → Developer settings → OAuth Apps) with:
     - **Homepage URL:** `http://localhost:3000`
     - **Authorization callback URL:** `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Paste the Client ID and Client Secret into the Supabase provider settings.
3. **Redirect URLs** — Dashboard → Authentication → URL Configuration: add `http://localhost:3000/**` to the allowed redirect URLs.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without configuration the app runs on demo (mock) data; once Supabase is configured you can **Sign in with GitHub** and your real repositories, contributions, commits, PRs, issues, and tasks appear.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Run unit tests (Vitest, single run) |
| `npm run test:watch` | Run tests in watch mode |

## Testing

Unit tests cover the pure utility layer with deterministic, injected clocks:

- `task-utils` — priority/status ordering, due-date comparison with null-last semantics, filtering (status, priority, search, overdue-only), overdue detection, status counts.
- `contribution-utils` — longest/current streak calculation (including the "today isn't over yet" trailing-day grace), heatmap intensity levels, Sunday-aligned grid construction.
- `date-utils` — relative timestamps, due-date labels (`Today`, `Tomorrow`, `Overdue · Sep 10`, …), compact numbers.

```bash
npm test
```

## Deployment (Vercel)

1. Push the repository to GitHub.
2. In Vercel, **Add New Project** and import the repository — the Next.js preset is detected automatically.
3. Add environment variables in **Project → Settings → Environment Variables** (all environments):

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - *(optional)* `GITHUB_TOKEN`

4. In Supabase → Authentication → URL Configuration, add your production URL to the allowed redirect URLs, and update the GitHub OAuth app's homepage URL to your production domain.
5. Deploy. Every push to `main` triggers a new deployment.

> No build-time secrets are required — the GitHub access token is the signed-in user's OAuth provider token read from their session, server-side only.

## Project Structure

```text
src/
├── app/                    # App Router pages, layouts, loading & error UI
│   ├── auth/callback/      #   OAuth code exchange
│   ├── tasks/ pull-requests/ issues/ commits/
│   └── page.tsx            #   Dashboard
├── components/             # App shell, sections, states, task manager
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── data-provider.ts    # DataProvider interface + mock provider
│   ├── client-data-provider.ts / server-data-provider.ts  # context wiring
│   ├── github.ts           # server-only GitHub client (token handling)
│   ├── providers/          # GitHub API, Supabase task, composed providers
│   ├── supabase/           # browser/server clients, session refresh
│   ├── task-utils.ts / contribution-utils.ts / date-utils.ts  # tested logic
│   └── *.test.ts           # Vitest suites
└── proxy.ts                # Supabase session refresh for every request
supabase/schema.sql         # tasks table + RLS policies (run in Supabase)
```

## Security Notes

- The GitHub access token lives only in the server session and is used exclusively inside server-only modules (`import "server-only"` guards accidental client import).
- The Supabase anon key is public by design; all authorization is enforced by Postgres Row Level Security — users can only select/insert/update/delete their own tasks.
- No secrets are committed: `.env*` is git-ignored, `.env.example` documents the shape.
- API responses are cached with revalidation and rate-limit errors surface as friendly UI states.

## Roadmap

- [ ] Repository detail pages with per-repo commit/PR history
- [ ] Task ↔ GitHub issue linking
- [ ] Contribution goals and notifications
- [ ] Component tests with Testing Library

---

Built as a full-stack exercise in clean architecture: mock-first UI, swappable data providers, and security enforced at the database layer. See [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) for the original phase-by-phase plan.
