# Repo Context: GreensWeveSeen — Golf Score Tracker
Source: GitHub (becketmccurdy/greensweveseen)

## What it is (one line)
Modern, mobile-first PWA to log golf rounds, manage courses, and view stats; built on Next.js 15 (App Router) + Supabase + Prisma + Tailwind + shadcn/ui. :contentReference[oaicite:0]{index=0}

## Current stack & structure
- Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui/Radix; PWA (SW + manifest). Supabase Auth + Postgres; Prisma ORM; Vercel deploy; RLS enabled. :contentReference[oaicite:1]{index=1}
- Key files/folders observed: `/src`, `/prisma`, `middleware.ts`, `supabase-rls-policies*.sql`, `supabase-postgis.sql`, `playwright.config.ts`, `tests/`, `DEPLOYMENT.md`, `README.md`. :contentReference[oaicite:2]{index=2}
- Entities (per README): `UserProfile`, `Course`, `Round`, `Score`, `Friendship`, `FriendActivity`. Features include auth, dashboard KPIs, round tracking, course mgmt, mobile-first PWA. :contentReference[oaicite:3]{index=3}
- Next steps listed in README: add hole-by-hole tracking, stats/analytics, friends/social, course discovery/ratings, photo uploads, push notifications. :contentReference[oaicite:4]{index=4}

## Gaps & quick wins (based on repo/README)
1) Hole-by-hole scorecard UX and DB wiring not finished. 2) Stats/KPIs are basic; no advanced analytics. 3) Social graph exists in schema but likely missing UI and activity feed. 4) Course discovery/rating and media uploads are TODO. 5) Push notifications not wired (PWA is present). :contentReference[oaicite:5]{index=5}

---

# Requested Improvements (make concrete edits)
> Goal: ship a usable v1 with hole-by-hole entry, basic analytics, and friend feed; harden auth/RLS, add tests, and prep prod deploy.

## A) Data model & RLS (Prisma + Supabase)
- **Prisma schema** (`/prisma/schema.prisma`): ensure models + relations exist:
  - `UserProfile (userId pk, handicap, createdAt)`, `Course (id, name, par, holes, location, rating, slope, createdById)`, `Round (id, userId, courseId, date, totalScore, weather, notes)`, `Score (id, roundId, holeNumber, strokes, putts, gir, fairwayHit)`, `Friendship (id, userId, friendId, status)`, `FriendActivity (id, userId, type, data, createdAt)`.
- **Migrations**: run `npx prisma migrate dev` locally, `npx prisma migrate deploy` on prod as README suggests. :contentReference[oaicite:6]{index=6}
- **RLS**: apply `supabase-rls-policies-safe.sql`; verify per-row ownership: users can `SELECT/INSERT/UPDATE/DELETE` only their rows; friends visible via join only when mutual. (Use provided SQL file as baseline.) :contentReference[oaicite:7]{index=7}

## B) Auth & middleware
- **`/middleware.ts`**: gate `/app/(protected)/**` routes; read Supabase session; redirect to `/login` if missing. Ensure edge-safe checks and exclude static assets. :contentReference[oaicite:8]{index=8}
- **Server actions**: centralize mutations under `/src/app/(protected)/*/actions.ts`.

## C) Hole-by-hole score entry (v1)
- **Routes & UI**
  - Create: `/src/app/rounds/new/page.tsx` (wizard: course→date/weather→hole-by-hole).
  - View: `/src/app/rounds/[id]/page.tsx` (scorecard + per-hole table).
- **Components**
  - `/src/components/scorecard/HoleRow.tsx` (strokes, putts, FIR/GIR toggles).
  - `/src/components/scorecard/ScorecardForm.tsx` (Zod schema, react-hook-form).
- **Server actions**
  - `/src/app/rounds/actions.ts`: `createRound`, `upsertScores(roundId, scores[])`, `recomputeRoundTotals`.
- **Validation**
  - `/src/lib/validation/score.ts`: Zod schemas for `RoundInput`, `HoleScoreInput`.
- **DB**
  - Batch insert `Score[]`; recalc `Round.totalScore` in a single transaction.

## D) Analytics (MVP)
- **KPIs**: expand dashboard `/src/app/(protected)/dashboard/page.tsx`:
  - Rolling avg score (last 5), best/worst rounds, FIR%, GIR%, putts/round, par-3/4/5 scoring.
- **Queries**: `/src/lib/queries/stats.ts` with typed Prisma aggregations.
- **Charts**: `/src/components/charts/*` with Recharts (keep lightweight; SSR-safe).

## E) Course management
- **Create/Edit**: `/src/app/courses/new` + `/src/app/courses/[id]/edit`.
- **Location**: optional Mapbox place search (uses `NEXT_PUBLIC_MAPBOX_TOKEN`) already referenced in env. :contentReference[oaicite:9]{index=9}

## F) Friend graph & activity feed
- **Friendship**
  - UI: `/src/app/friends/page.tsx` (search by email/username, send/accept).
  - Server actions: `sendRequest`, `acceptRequest`, `removeFriend`.
- **Activity**
  - `/src/app/feed/page.tsx` to render `FriendActivity` (e.g., “Becket shot 82 at Torrey North”).
  - Emit events on `createRound` and `pb upload` (below).

## G) Media uploads (round photos)
- **Page**: `/src/app/rounds/[id]/media.tsx`
- **Storage**: Supabase storage bucket `round-photos/USERID/ROUNDID/*`; signed URLs.

## H) PWA + Notifications
- Ensure manifest + SW are present; add **in-app** “Add to Home Screen” prompt.
- Stub push via `Notification.requestPermission()`; plan server push later.

## I) DX, perf, and safety
- **Env**: `.env.local` → `NEXT_PUBLIC_*`, `DATABASE_URL` (pgBouncer 6543), `DIRECT_URL` (5432) per README. :contentReference[oaicite:10]{index=10}
- **Prisma**: use connection pooling flags (`pgbouncer=true&connection_limit=1&sslmode=require`) already documented. :contentReference[oaicite:11]{index=11}
- **Caching**: use `revalidatePath('/dashboard')` post-mutations; `noStore()` for per-user pages.
- **Error boundaries**: add `error.tsx` + `loading.tsx` in critical routes.
- **A11y**: keyboardable controls, input labels, focus ring via Tailwind.

## J) Tests
- **Unit** (Vitest/RTL): form validation, stat reducers.
- **E2E** (Playwright): auth flow, new round wizard, dashboard KPIs. Repo already has `playwright.config.ts` & `tests/`; add scenarios to cover scorecard flows. :contentReference[oaicite:12]{index=12}

---

# Task List for the Assistant (make these edits)
1. Design Prisma models (if missing) & generate migration; apply safe RLS SQL. :contentReference[oaicite:13]{index=13}
2. Implement `/rounds/new` wizard + `/rounds/[id]` view with form validation and server actions.
3. Build scorecard components (`HoleRow`, `ScorecardForm`) and batch insert logic.
4. Expand dashboard KPIs and add simple charts.
5. Ship friend requests + feed pages; write server actions and emit `FriendActivity`.
6. Wire media uploads to Supabase storage with signed URLs.
7. Add error boundaries/loading states across protected routes; confirm `middleware.ts` guards.
8. Add Playwright tests for auth→create round→view stats.

## Acceptance criteria (v1)
- Create a round with 18 holes in <90s on mobile; see updated KPIs on dashboard.
- Friend can see new round in feed (mutual friendship).
- All protected pages require auth; RLS prevents cross-user reads/writes.
- E2E tests green for happy path; deploy to Vercel with pooled DB URLs.

## Notes from repo docs
- README enumerates stack, features, PWA, setup (env vars, Prisma URLs, Mapbox), deploy steps, and “Next Steps” (scorecard, stats, social, discovery, photos, push). Use these as the source of truth. :contentReference[oaicite:14]{index=14}
