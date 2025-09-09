# Deployment (Vercel + Supabase)

This project is optimized for Vercel (Next.js) with Supabase for Auth + Postgres.

## 1) Connect the repo to Vercel
1. Go to https://vercel.com/new
2. Import the GitHub repo `becketmccurdy/greensweveseen1`
3. Framework preset will auto-detect Next.js

## 2) Set environment variables (Vercel Project → Settings → Environment Variables)

Required:

```bash
# Public
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_APP_URL=https://<your-vercel-domain>
NEXT_PUBLIC_MAPBOX_TOKEN=<mapbox_token>

# Prisma runtime (use Supabase Connection Pooling, port 6543)
DATABASE_URL="postgresql://USER:PASSWORD@db.<PROJECT_REF>.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

# Prisma CLI (direct connection, port 5432)
DIRECT_URL="postgresql://USER:PASSWORD@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require"
```

Tip: Find both URLs in Supabase → Database → Connection string (URI) and Connection pooling.

## 3) Prisma Migrations

Locally (development):

```bash
npx prisma migrate dev
# or, if prototyping without creating migrations:
# npx prisma db push
```

Production (after Vercel deploy):

```bash
npx prisma migrate deploy
```

Prisma will use `DIRECT_URL` for migrations and `DATABASE_URL` at runtime.

## 4) Apply RLS policies

In the Supabase SQL Editor, run the contents of `supabase-rls-policies-safe.sql` to ensure Row Level Security is enforced across all tables (including `round_friends`).

## 5) Done

Vercel will automatically build on pushes and create preview deployments for PRs.

## Notes
- `next.config.js` uses `output: 'standalone'`, which is harmless on Vercel.
- Keep all Prisma access on the server (as written), and never expose service-role keys to the client.
