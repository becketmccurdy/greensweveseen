# Deployment Instructions for greensweveseen.com

## 1. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `greensweveseen`
3. Make it public
4. Don't initialize with README (we already have one)
5. Click "Create repository"

## 2. Push to GitHub ✅ COMPLETED
The code has been pushed to: https://github.com/becketmccurdy/greensweveseen1

## 3. Deploy to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository `greensweveseen`
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: https://aqagrxavkpskjdtpwnjy.supabase.co

## 📋 Environment Setup

Your `.env.production` file should contain:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# Production URL (will be updated after first deployment)
NEXT_PUBLIC_APP_URL=https://your-app-url.run.app
```

## 🚀 Quick Deployment

### Option 1: Automated Deployment Script

```bash
# Set your Google Cloud project
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_REGION="us-central1"

# Run the deployment script
./deploy.sh

# Set up environment variables
./setup-env.sh
NEXT_PUBLIC_SUPABASE_URL=https://aqagrxavkpskjdtpwnjy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxYWdyeGF2a3Bza2pkdHB3bmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDU2ODQsImV4cCI6MjA3MjUyMTY4NH0.lq-zcC08FUQw3Op7vtjOSxWGEJDtyanbIfwycXZIBRw
DATABASE_URL=postgresql://postgres:i76MSgHWTmr7vsWx@db.aqagrxavkpskjdtpwnjy.supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL=https://greensweveseen.com
```
