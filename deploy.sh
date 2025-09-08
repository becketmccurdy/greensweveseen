#!/bin/bash

# GreensWeveSeen - Google Cloud Run Deployment Script

set -e

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"your-project-id"}
SERVICE_NAME="greensweveseen"
REGION=${GOOGLE_CLOUD_REGION:-"us-central1"}
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🏌️ Deploying GreensWeveSeen to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "📤 Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

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
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "NEXT_TELEMETRY_DISABLED=1" \
  --project $PROJECT_ID

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)' --project=$PROJECT_ID
