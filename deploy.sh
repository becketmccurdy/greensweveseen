#!/bin/bash

# GreensWeveSeen - Google Cloud Run Deployment Script

set -e

# Configuration
# Prefer GOOGLE_CLOUD_PROJECT; otherwise fall back to current gcloud config
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project 2>/dev/null)}
SERVICE_NAME="greensweveseen"
REGION=${GOOGLE_CLOUD_REGION:-"us-central1"}

if [ -z "$PROJECT_ID" ]; then
  echo "❌ No GCP project configured. Set GOOGLE_CLOUD_PROJECT env var or run: gcloud config set project <your-project-id>"
  exit 1
fi

IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🏌️ Deploying GreensWeveSeen to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Build container image (local Docker if available, otherwise Cloud Build)
if command -v docker >/dev/null 2>&1; then
  echo "📦 Building Docker image locally..."
  docker build -t "$IMAGE_NAME" .

  echo "📤 Pushing image to Google Container Registry..."
  docker push "$IMAGE_NAME"
else
  echo "🐳 Docker not found. Falling back to Google Cloud Build (remote build)."
  echo "📦 Submitting build to Cloud Build..."
  gcloud builds submit --tag "$IMAGE_NAME" --project "$PROJECT_ID"
fi

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1" \
  --project $PROJECT_ID

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)' --project=$PROJECT_ID
