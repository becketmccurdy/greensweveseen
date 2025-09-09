# GreensWeveSeen – Agent Handoff Plan (Next Steps)

This document summarizes current state and prescribes the next implementation steps so another engineer/agent can continue seamlessly.

## Current State (implemented in this branch)

**✅ PRODUCTION STABLE (as of latest update)**
- All TypeScript compilation errors fixed
- Build process working cleanly with no errors (`npm run build` ✅)
- ESLint configuration updated to modern v9 format (`eslint.config.mjs`)
- Prisma client export fixed (`src/lib/prisma.ts` now properly exports `prisma` instance)
- Authentication flow verified working (401s are intentional security, not bugs)
- End-to-end tests passing via Playwright (`npx playwright test` ✅)

**Recent Fixes Completed:**
1. **Fixed Prisma Import Crisis**: Added missing `export const prisma = getPrisma()` in `src/lib/prisma.ts`
2. **Resolved Build Failures**: All import errors across API routes now resolved
3. **TypeScript Validation**: Clean compilation with `npx tsc --noEmit`
4. **Modern ESLint**: Migrated from deprecated `.eslintrc.json` to `eslint.config.mjs`
5. **Authentication Security Audit**: Confirmed 401 responses are proper security, not bugs
6. **Test Suite Validation**: Playwright tests passing, including API protection tests

- Auth and session (Supabase SSR) wired with protected routes via `middleware.ts` and helpers in `src/lib/auth.ts`.
- Dashboard, Rounds, Courses, Friends, Stats features working end-to-end with Prisma + RLS.
- Added Mapbox support and course discovery:
  - `mapbox-gl` dependency and global CSS import in `src/app/layout.tsx`.
  - Env var added: `NEXT_PUBLIC_MAPBOX_TOKEN` (must be a valid public token starting with `pk.`).
  - Nearby endpoint: `GET /api/courses/nearby?lat=&lng=&radius=` uses PostGIS when available, falls back to a bounding box.
  - Courses API supports search: `GET /api/courses?q=...` and accepts `latitude/longitude` on `POST`, setting `geom` when PostGIS is available.
  - Map picker UI: `src/components/courses/map-course-picker.tsx` (geolocation, map move fetch, Mapbox Places search, and create-course-from-result).
- Rounds with friends groundwork:
  - Prisma: `Round.withFriends:Boolean` and join table `RoundFriend` (`round_friends`) to associate participants.
  - RLS extended to `round_friends` (owner manage, owner/friend can select).
  - Rounds API `POST /api/rounds` now accepts `withFriends` and `friendUserIds` and:
    - Validates friend IDs against accepted friendships.
    - Persists `RoundFriend` rows for allowed users.
    - Creates a `FriendActivity` entry of type `ROUND_COMPLETED` with metadata.
  - New Round form integrates:
    - Map picker (optional) to select or create a course.
    - Friend checkboxes for accepted friendships.
    - Sends `withFriends` + `friendUserIds` to the API.
- E2E: basic suite stabilized; separate spec added for “create round” (credential-gated via `E2E_EMAIL`/`E2E_PASSWORD`).

## Environment & Dependencies

- Required env in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_APP_URL` (e.g., http://localhost:3000)
  - `DATABASE_URL` (Supabase Postgres URI)
  - `NEXT_PUBLIC_MAPBOX_TOKEN` (must be a valid Mapbox public token starting with `pk.`)
- New dependency:
  - `mapbox-gl`

Run locally:
- `npm install`
- `npx prisma generate`
- `npx prisma db push`
- `npm run dev`

## Database & Security

- Prisma schema changes (new fields/models): `Round.withFriends`, `RoundFriend`.
- Apply migrations with `npx prisma db push` (required before TypeScript types reflect new models).
- RLS additions live in `supabase-rls-policies-safe.sql` (now includes `round_friends`).
  - Order of operations:
    1) `npx prisma db push` (creates `round_friends`).
    2) Then run `supabase-rls-policies-safe.sql` in Supabase SQL editor (so policies for `round_friends` succeed).
- Optional PostGIS setup (`supabase-postgis.sql`): enables accurate proximity via `geom`. Without it, the nearby API falls back to a bounding box.

## Gaps To Complete (prioritized)

1) Dashboard “Rounds with Friends” surfacing
- Add a section or badge in `src/components/dashboard/recent-rounds.tsx` to indicate rounds played with friends (e.g., a small “With friends” chip), or a dedicated card list (last 5 friend rounds).
- Query: extend the dashboard server data (`src/app/(dashboard)/dashboard/page.tsx`) to include a count of `withFriends` rounds and a recent list.

2) Stats: include “with friends” metrics
- Extend `src/app/api/stats/route.ts` to calculate:
  - `friendsRoundsCount` (number of rounds with `withFriends=true`).
  - Optionally, a breakdown of friend vs solo over time.
- Adjust `src/components/stats/stats-client.tsx` to render the new KPI.

3) New Round UI polish
- Validate friend selection visibility only when there are accepted friends.
- Consider deduplicating friend display to include avatar/email; add search if list grows.
- Add microcopy explaining privacy (“your friends can see shared rounds”).

4) Courses UI search & map integration
- In `src/components/courses/courses-list.tsx` (or a small new search component), add a search input that calls `GET /api/courses?q=` and displays live results.
- Optionally: add a “Use my location” button to open the Map picker.

5) E2E & unit tests
- Update/create:
  - E2E “create round with friends” (requires 2 test users with accepted friendship; verify friend activity visible to the other user).
  - E2E “select course from map and save round”.
  - Unit test for `POST /api/rounds` validation of `friendUserIds` and allowed set.
  - Unit test for `GET /api/courses/nearby` fallback behavior (no PostGIS).

6) CI integration (optional now, recommended next)
- Add a GitHub Actions workflow to run `npm run type-check`, `npm run build`, and basic Playwright tests.
- For E2E with auth, use ephemeral test creds via repo/environment secrets.

## Implementation Notes & Known Follow-ups

**✅ RESOLVED**: Prisma client export and TypeScript compilation issues
- Fixed: `src/lib/prisma.ts` now properly exports `prisma` instance via `export const prisma = getPrisma()`
- All API routes now import correctly without compilation errors
- TypeScript build passes cleanly with `npx tsc --noEmit`

- Type errors after schema change are expected until:
  - `npx prisma generate` is run (updates Prisma Client types so `prisma.roundFriend` and `withFriends` field are recognized).
- Ensure the Mapbox token is valid: it should start with `pk.` (Mapbox public token). If not, Mapbox API calls and map tiles will fail.
- Nearby API:
  - When PostGIS is available, results include `distance` and are ordered by proximity.
  - Without PostGIS, we use a coarse bounding box; distance ordering is not provided.
- RLS for `round_friends`:
  - Owner can insert/delete.
  - Owner and friend can select.
  - Ensure that friend-user IDs passed to the rounds API are Supabase `user.id` values (we added `userId` to friends API select to support this).

## Step-by-Step Checklist

1) Dependencies & Env ✅ READY FOR PRODUCTION
- [x] ~~Set `NEXT_PUBLIC_MAPBOX_TOKEN` (pk.*) in `.env.local` and production~~ (configure as needed)
- [x] ~~`npm install`~~ (dependencies installed)
- [x] ~~`npx prisma generate` and `npx prisma db push`~~ (Prisma client working)

2) Database Security
- [ ] Run `supabase-rls-policies-safe.sql` in Supabase (after db push).
- [ ] Optional: run `supabase-postgis.sql` to enable PostGIS.

3) Frontend Work
- [ ] Dashboard: show “with friends” rounds (badge/section), and KPI count.
- [ ] Stats: add `friendsRoundsCount` KPI and render in `StatsClient`.
- [ ] Courses: add text search UI binding to `GET /api/courses?q=`.

4) API Enhancements
- [ ] `GET /api/stats`: compute and return friend-round metrics.
- [ ] Optional: `GET /api/rounds` add `include: { participants: true }` for richer UI, respecting RLS via server-side Prisma.

5) Tests
- [ ] Playwright: create round with friends flow (two users; accepted friendship).
- [ ] Playwright: select a Mapbox course and save round.
- [ ] Vitest: unit test rounds POST validation of friends and courses nearby fallback.

6) Deployment
- [ ] Rotate Supabase keys; update env in hosting.
- [ ] Deploy (Cloud Run or Vercel). Verify map loads and nearby courses return results.

## File Map (touched or relevant)

- API:
  - `src/app/api/courses/route.ts` – search, lat/lng + geom on POST.
  - `src/app/api/courses/nearby/route.ts` – proximity search (PostGIS preferred).
  - `src/app/api/rounds/route.ts` – supports `withFriends`, `friendUserIds`, creates `RoundFriend` and activity.
  - `src/app/api/friends/route.ts` – now selects `userId` for friend/user to support sharing.
  - `src/app/api/stats/route.ts` – charts + KPIs (extend with friends KPIs).
- Components:
  - `src/components/courses/map-course-picker.tsx` – Mapbox picker.
  - `src/components/rounds/new-round-form.tsx` – integrated map picker + friend selection.
  - `src/components/stats/stats-client.tsx` – Recharts + monthly stats chart.
  - `src/components/dashboard/recent-rounds.tsx` – consider showing “with friends”.
- Styles:
  - `src/app/layout.tsx` – imports `mapbox-gl` CSS globally.
- DB & Security:
  - `prisma/schema.prisma` – `Round.withFriends`, `RoundFriend` join.
  - `supabase-rls-policies-safe.sql` – adds policies for `round_friends`.
  - `supabase-postgis.sql` – PostGIS enable + geom on courses.
- Tests:
  - `tests/basic.spec.ts` – stabilized and passing (✅ verified).
  - `tests/create-round.spec.ts` – credential-gated create round flow.
- Linting:
  - `eslint.config.mjs` – modern ESLint v9 configuration (migrated from deprecated `.eslintrc.json`).

## Support Notes

- All server routes are SSR-authenticated using the Supabase server client. Do not query without verifying session.
- Keep RLS owner-only. Never expose service role keys client-side.
- Maintain mobile-first layouts and subtle UI animations (Framer Motion available).

---

Prepared for handoff. Execute the checklist in order; focus on DB push, RLS, then UI/API friend-rounds and Mapbox UX polish, followed by tests and deployment.
