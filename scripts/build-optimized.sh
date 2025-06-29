#!/bin/bash

# Optimized Docker Build Script for DOB Validator
# This script enables BuildKit and uses parallel builds for faster builds

set -e

echo "🚀 Starting optimized Docker build for DOB Validator..."

# Enable Docker BuildKit for better caching and parallel builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build arguments for better caching
BUILD_ARGS="--build-arg BUILDKIT_INLINE_CACHE=1"

echo "📦 Building images with BuildKit enabled..."

# Build all services in parallel with optimized settings
docker compose -f docker-compose.prod.yml build \
  --parallel \
  --no-cache=false \
  --progress=plain \
  $BUILD_ARGS \
  backend frontend backoffice

echo "✅ Build completed successfully!"
echo ""
echo "📊 Build Summary:"
echo "- Backend:   dob-validator-backend-prod"
echo "- Frontend:  dob-validator-frontend-prod"
echo "- Backoffice: dob-validator-backoffice-prod"
echo ""
echo "🚀 To start the services, run:"
echo "docker compose -f docker-compose.prod.yml up -d" 