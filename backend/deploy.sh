#!/bin/bash

# DOB Validator Backend Deployment Script
# This script deploys the backend to Google Cloud

set -e

echo "🚀 Starting DOB Validator Backend Deployment..."

# Configuration
PROJECT_ID="stoked-utility-453816-e2"
IMAGE_NAME="dob-validator-backend"
REGION="us-central1"  # Adjust as needed

echo "📋 Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Image Name: $IMAGE_NAME"
echo "  Region: $REGION"

# Step 1: Build the Docker image
echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME .

# Step 2: Tag for Google Cloud
echo "🏷️  Tagging image for Google Cloud..."
docker tag $IMAGE_NAME gcr.io/$PROJECT_ID/$IMAGE_NAME:latest

# Step 3: Push to Google Cloud
echo "📤 Pushing image to Google Cloud..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME:latest

echo "✅ Image pushed successfully!"

# Step 4: Deploy to Cloud Run (if using Cloud Run)
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy dob-validator-backend \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 4000 \
  --set-env-vars NODE_ENV=production

echo "🎉 Deployment completed successfully!"
echo "🌍 Backend should be available at the URL shown above" 