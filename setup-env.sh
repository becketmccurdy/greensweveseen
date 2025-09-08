#!/bin/bash

# GreensWeveSeen - Environment Variables Setup for Google Cloud Run

set -e

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"your-project-id"}
SERVICE_NAME="greensweveseen"
REGION=${GOOGLE_CLOUD_REGION:-"us-central1"}

echo "🔧 Setting up environment variables for GreensWeveSeen"
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production with your Supabase credentials"
    exit 1
fi

# Source the production environment variables
source .env.production

# Validate required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ -z "$DATABASE_URL" ]; then
    echo "❌ Missing required Supabase environment variables in .env.production"
    echo "Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" ]; then
    echo "❌ Missing Firebase project ID in .env.production"
    echo "Required: NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    exit 1
fi

# Set the production URL based on your Cloud Run service
PRODUCTION_URL="https://${SERVICE_NAME}-$(gcloud config get-value project | tr ':' '-' | tr '.' '-')-${REGION}.a.run.app"

echo "🌐 Setting production URL to: $PRODUCTION_URL"

# Update Cloud Run service with environment variables
echo "📝 Updating Cloud Run service with environment variables..."
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}" \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  --set-env-vars="DATABASE_URL=${DATABASE_URL}" \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}" \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}" \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}" \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}" \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}" \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}" \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}" \
  --set-env-vars="NEXT_PUBLIC_APP_URL=${PRODUCTION_URL}" \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="NEXT_TELEMETRY_DISABLED=1" \
  --project=$PROJECT_ID

echo "✅ Environment variables updated successfully!"
echo "🔗 Service URL: $PRODUCTION_URL"
