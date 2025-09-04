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
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxYWdyeGF2a3Bza2pkdHB3bmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDU2ODQsImV4cCI6MjA3MjUyMTY4NH0.lq-zcC08FUQw3Op7vtjOSxWGEJDtyanbIfwycXZIBRw
   - `DATABASE_URL`: postgresql://postgres:i76MSgHWTmr7vsWx@db.aqagrxavkpskjdtpwnjy.supabase.co:5432/postgres
   - `NEXT_PUBLIC_APP_URL`: https://greensweveseen.com
5. Click "Deploy"

## 4. Configure Custom Domain
1. In Vercel dashboard, go to your project
2. Go to Settings → Domains
3. Add domain: `greensweveseen.com`
4. Add domain: `www.greensweveseen.com` (redirect to main)
5. Follow Vercel's DNS instructions

## 5. Update DNS Records
In your domain registrar (where you bought greensweveseen.com):

### A Records:
- Name: `@` (root domain)
- Value: `76.76.19.61` (Vercel's IP)

### CNAME Records:
- Name: `www`
- Value: `cname.vercel-dns.com`

## 6. Update Supabase Auth Settings
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add these URLs:
   - Site URL: `https://greensweveseen.com`
   - Redirect URLs: 
     - `https://greensweveseen.com/auth/callback`
     - `https://www.greensweveseen.com/auth/callback`

## 7. Test Deployment
1. Wait for DNS propagation (5-30 minutes)
2. Visit https://greensweveseen.com
3. Test user registration and login
4. Test creating a golf round
5. Verify PWA installation works

## Environment Variables Summary
```
NEXT_PUBLIC_SUPABASE_URL=https://aqagrxavkpskjdtpwnjy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxYWdyeGF2a3Bza2pkdHB3bmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDU2ODQsImV4cCI6MjA3MjUyMTY4NH0.lq-zcC08FUQw3Op7vtjOSxWGEJDtyanbIfwycXZIBRw
DATABASE_URL=postgresql://postgres:i76MSgHWTmr7vsWx@db.aqagrxavkpskjdtpwnjy.supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL=https://greensweveseen.com
```
