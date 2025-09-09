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

Your production environment should contain:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://aqagrxavkpskjdtpwnjy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://postgres:[password]@db.aqagrxavkpskjdtpwnjy.supabase.co:5432/postgres

# Production URL (Firebase Hosting with Cloud Run backend)
NEXT_PUBLIC_APP_URL=https://greensweveseen.web.app
```

## ✅ DEPLOYMENT COMPLETE

**Live URLs:**
- **Primary App**: https://greensweveseen.web.app (Firebase Hosting)
- **Backend Service**: https://greensweveseen-303526391321.us-central1.run.app (Cloud Run)

The app uses Firebase Hosting with rewrites to Cloud Run for optimal performance and custom domain support.

## 🚀 Quick Deployment

### Option 1: Automated Deployment Script

```bash
# Set your Google Cloud project
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_REGION="us-central1"

# Run the deployment script
./deploy.sh

# Set up environment variables (do NOT commit real values)
./setup-env.sh
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
DATABASE_URL=postgresql://postgres:<password>@db.<your-project>.supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL=https://greensweveseen.com
```
