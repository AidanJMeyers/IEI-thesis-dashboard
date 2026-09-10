# Thesis Command Center

**IEI Honors Thesis — Rollins College**

A live progress hub for *Environmental Exposure and Childhood Asthma Outcomes: Development
and Validation of an Integrated Exposure Index Using the BREATHE-CC Cohort* (Aidan Meyers,
Rollins College Honors Degree Program, HON 498 HD / HON 499 HD).

It tracks a 33-week plan from **Aug 31, 2026** to **May 1, 2027**: 12 graded evaluation
components, 126 tasks, 27 sponsor meetings, and the IRB dependency that gates the whole
fall semester.

Companion reference for the study this thesis sits inside:
[**BREATHE-CC Documentation Dashboard**](https://aidanjmeyers.github.io/breathe-cc-documentation/)
— linked from the header of every page.

---

## Two ways to run it

The dashboard decides its storage mode from whether Supabase environment variables are
present. **The UI is identical either way** — only where the data lives changes.

| | Local mode | Supabase mode |
|---|---|---|
| Setup | none | Supabase project + migration + seed |
| Data source | seeded from `context/*.json` | Postgres |
| Persistence | that visitor's `localStorage` | shared database |
| Files | inline, ≤ 2 MB, that browser only | Supabase Storage, signed URLs |
| Committee sees your edits | no — each visitor gets a fresh seed | yes, live |
| Realtime | — | tasks, components, files, activity |

**Local mode** is what the GitHub Pages deployment runs. It is genuinely useful — the full
plan, timeline, evaluation weights, and study context are all there and always available —
but it is a *read* of the plan, not a shared workspace.

**Supabase mode** is what makes it a live hub the committee can watch. Set it up when you
want Dr. Brown to see a task move without you sending a screenshot.

### Local mode

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. Nothing else to configure.

### Supabase mode

```bash
cp .env.local.example .env.local     # then fill in the three values
```

1. Create a free project at [supabase.com](https://supabase.com).
2. **Project Settings → API** → copy the URL, the `anon` key, and the `service_role` key
   into `.env.local`.
3. **SQL Editor** → paste and run `supabase/migrations/001_initial_schema.sql`.
   This creates every table, all Row Level Security policies, the realtime publication,
   and the storage policies.
4. Create the buckets and seed the data:

```bash
pnpm setup:storage
pnpm seed
```

5. Turn **off** public signups: **Authentication → Providers → Email →
   "Allow new users to sign up"**. Accounts should only exist by invitation.
6. **Authentication → Users → Invite** yourself. A trigger creates your profile row with
   the read-only `committee` role; promote yourself:

```sql
update public.profiles set role = 'student' where email = 'Ameyers@rollins.edu';
```

   RLS denies every read until a profile row exists, so this step is not optional.
7. `pnpm dev`, then sign in from **Settings**. The header badge should read **Live**.

Re-running `pnpm seed` is safe — ids are deterministic, so it upserts rather than
duplicating. `pnpm seed -- --wipe` starts clean.

---

## Deploying

### GitHub Pages (already wired up)

`.github/workflows/deploy-pages.yml` builds the static export on every push to `main` and
publishes it. Enable it once: **Settings → Pages → Source: GitHub Actions**.

Result: <https://aidanjmeyers.github.io/IEI-thesis-dashboard/>

### Vercel (for the shared, writable version)

Import the repo at [vercel.com/new](https://vercel.com/new), add the three environment
variables from `.env.local`, and deploy. No other configuration is needed — the standard
`next build` runs when `NEXT_STATIC_EXPORT` is unset.

---

## Access model

Enforced by Row Level Security in Postgres, not by the UI:

| Role | Access |
|---|---|
| `student` (Aidan) | Full read/write on everything |
| `sponsor` (Dr. Brown) | Read everything; can annotate meetings |
| `committee` (Dr. Mohammadi, Dr. Jasser) | Read everything; can annotate meetings |
| `external` (Dr. Melaram) | Evaluation components, tasks, and files only — no weekly plan, meeting notes, or internal links |

`/committee` is a read-only view designed for sharing. Storage buckets are private; files
are served through short-lived signed URLs.

**Note on repository visibility.** This repository is public, which is what lets GitHub
Pages serve it on the free tier. Nothing in `context/` or the seeded data contains
participant information — it is task tracking and study *architecture*, not study *data*.
Keep it that way: never commit a REDCap export, a participant file, or an unpublished
result. Meeting notes you type in Supabase mode live in the database, not the repo.

---

## Project layout

```
├── context/                       Reference data — the single source of truth for seeding
│   ├── thesis-metadata.json       People, aims, calendar, branding
│   ├── evaluation-criteria.json   12 graded components with weights and due dates
│   ├── weekly-plan.json           33 weeks, 124 tasks, 27 meetings
│   ├── proposal-summary.md
│   ├── breathecc-data-context.md
│   └── time-activity-supplement/  The drafted REDCap instrument + design memo
├── scripts/
│   ├── seed.ts                    Populates Supabase from context/
│   └── setup-storage.ts           Creates the two private buckets
├── supabase/migrations/
│   └── 001_initial_schema.sql     Tables, RLS, realtime, storage policies
└── src/
    ├── app/                       One route per page (App Router)
    ├── components/
    │   ├── ui/                    shadcn/ui-style primitives (Radix-backed)
    │   ├── layout/ dashboard/ tasks/ weeks/ evaluation/ files/ meetings/ shared/
    ├── hooks/useDashboard.ts      Memoised views over the store
    └── lib/
        ├── data/
        │   ├── seed.ts            context/*.json → initial state
        │   ├── store.tsx          The single write path for both backends
        │   └── selectors.ts       Derived values (progress, deadlines, urgency)
        ├── supabase/              Browser, server, and middleware clients
        ├── study.ts               BREATHE-CC architecture, verified against the export
        ├── thesis.ts              Static thesis facts and the critical path
        └── utils.ts               Dates, urgency, formatting
```

### How the data layer works

Every mutation goes through one function in `src/lib/data/store.tsx`:

```
action → producer(draft) → { next state, list of changed rows } → persist()
```

`persist()` writes the whole state to `localStorage` in local mode, or issues per-table
upserts/deletes in Supabase mode. Because both backends are fed by the same producer, they
cannot drift apart — and every page is written against one store interface rather than two.

---

## Pages

| Route | What it is for |
|---|---|
| `/` | Where the thesis stands today: stats, timeline, this week, deadlines, critical path, component grid, activity |
| `/weeks` | All 33 weeks grouped by phase |
| `/weeks/[n]` | One week: tasks, meeting agenda and notes, key decisions, deliverables |
| `/tasks` | Kanban board with drag-and-drop and filters |
| `/evaluation` | The 12 graded components, weighted progress charts, grade simulator |
| `/files` | File library (re-uploading a filename keeps both as versions) and link directory |
| `/meetings` | Meeting log with agendas, notes, and action items that convert into tasks |
| `/timeline` | Gantt: every component drawn across the 33 weeks |
| `/study` | **BREATHE-CC study context** — REDCap architecture, IEI inputs, the reconciled addition set, and the two companion documents |
| `/committee` | Read-only summary built for sharing |
| `/settings` | Storage mode, CSV/JSON export, restore, roles |

---

## Design decisions worth knowing

**Client-rendered, not server-rendered.** Every page reads from one client store. This is
what allows the same code to run as a zero-setup static export *and* as a live
Supabase-backed app. For a personal dashboard with no SEO requirement and no per-request
data, the tradeoff is entirely in favour of the dual-mode capability.

**Deterministic ids.** Seeded rows use readable ids (`w3-t2`, `meeting-w12`) rather than
random UUIDs, which makes re-seeding idempotent. The schema therefore uses `text` primary
keys where the original spec used `uuid`.

**`is_current` is derived, never stored.** The current week is recomputed from today's date
on every load, so the dashboard cannot go stale between visits.

**Dates are parsed as local, not UTC.** `new Date('2026-09-15')` is UTC midnight and would
render as Sep 14 anywhere west of Greenwich. `parseDate()` in `lib/utils.ts` splits the
parts explicitly. A due date always lands on the day it is written.

**No charting library.** The donut, the weighted-progress bars, the timeline, and the Gantt
are all hand-built SVG and CSS. Recharts was tried first and mis-scaled its own stacked
bars; replacing it removed ~100 kB from the evaluation page and made the arithmetic
readable in the markup. Nothing here needs axes, brushing, or zoom.

**Participation components measure elapsed time.** *Meeting Attendance & Participation* has
no linked tasks, so measuring it by task completion would peg it at 0% all year. It tracks
the fraction of its semester that has elapsed instead.

---

## Commands

```bash
pnpm dev              # development server
pnpm build            # production build (Vercel)
pnpm build:pages      # static export for GitHub Pages
pnpm typecheck        # tsc --noEmit
pnpm seed             # populate Supabase from context/
pnpm setup:storage    # create the storage buckets
```

---

## Context

The thesis is embedded in **BREATHE-CC**, a prospective pediatric respiratory health cohort
run by the Melaram Lab at Texas A&M University–Corpus Christi, based at Driscoll Children's
Hospital. The cohort is **actively enrolling and will not be finalized before defense** —
so Aim 2 delivers a reproducible, documented analysis pipeline validated on available data
rather than final effect estimates. The `/study` page states this in full, and the
dashboard repeats it wherever it shows progress, because it is the single most important
piece of framing for the committee.

The critical path is the **IRB modification** that deploys the missing exposure fields.

On **Sep 9, 2026** the drafted Time-Activity Supplement was reconciled against the
production dictionary, and the result changed the picture: of its 61 participant-facing
items, **22 duplicated fields that are already live** and 9 were obtainable from public
records. Critically, the secondary-residence and school addresses that were expected to
force a consent addendum are *already collected and geocoded* under the approved protocol
(`sec_street_address` is flagged `Identifier = Y`; `school_address` / `school_lat` /
`school_lon` are populated via API import). The recommended instrument is **10 items with
zero new HIPAA identifiers**, which should make this a minor modification rather than an
addendum.

That analysis lives in two Word documents under `public/deliverables/`, linked from the
`/study` page and seeded into the file library:

- **IEI Field Inventory and Minimal Addition Set** — production inventory, the item-by-item
  reconciliation, public-source substitutions, the 10-item recommendation, and the IRB analysis.
- **IEI Supplement — Sample Form and Item Justification** — the instrument as a participant
  sees it, with REDCap field types, branching syntax, calculated fields, and a justification table.
