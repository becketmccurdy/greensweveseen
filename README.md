# GreensWeveSeen - Golf Score Tracker

A modern, mobile-first golf score tracking application built with Next.js 15, Supabase, and Prisma.

## Features

- 🏌️ Track golf rounds and scores
- 📊 View statistics and KPIs
- 📱 Mobile-first PWA design
- 🔐 Secure authentication with Supabase
- 🎯 Course management
- 📈 Performance analytics

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Supabase (Auth + Database)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom green theme
- **PWA**: Service Worker + Web App Manifest

## Setup Instructions

### 1. Environment Variables

Update `.env.local` with your Supabase credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_postgres_connection_string

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the database migration:
   ```bash
   npx prisma db push
   ```
3. Apply RLS policies by running the SQL in `supabase-rls-policies.sql` in your Supabase SQL editor

### 3. Install Dependencies

```bash
npm install
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses the following main entities:

- **UserProfile**: User information and handicap
- **Course**: Golf courses with par and location
- **Round**: Individual golf rounds
- **Score**: Hole-by-hole scores
- **Friendship**: Friend connections
- **FriendActivity**: Activity feed for friends

## Key Features

### Authentication
- Magic link email authentication via Supabase
- Protected routes with middleware
- Automatic user profile creation

### Dashboard
- KPI cards showing total rounds, best score, average score, and handicap
- Recent rounds list with course information
- Mobile-responsive design

### Round Tracking
- Add new rounds with course selection
- Create new courses on-the-fly
- Track total score, weather, and notes

### PWA Support
- Installable web app
- Service worker for offline functionality
- Mobile-optimized interface

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Server-side session validation
- Protected API routes

## Mobile-First Design

- Responsive navigation (sidebar on desktop, mobile menu on mobile)
- Touch-friendly interface
- Optimized for mobile golf course usage
- 8px spacing scale with rounded corners

## Development

### Database Commands

```bash
# Push schema changes
npx prisma db push

# View database
npx prisma studio

# Generate client
npx prisma generate
```

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## Deployment

The app is configured for Vercel deployment with:
- Automatic builds on push
- Environment variable management
- Preview deployments

## Next Steps

1. Add hole-by-hole score tracking
2. Implement statistics and analytics
3. Add friend system and social features
4. Create course discovery and ratings
5. Add photo uploads for rounds
6. Implement push notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
