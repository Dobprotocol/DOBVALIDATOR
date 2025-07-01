#!/bin/bash

# Enable BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Set build arguments for optimization
export BUILDKIT_STEP_LOG_MAX_SIZE=10485760
export BUILDKIT_STEP_LOG_MAX_SPEED=10485760

echo "🚀 Building optimized production images..."

# Build images with parallel jobs and output options
docker compose -f docker/docker-compose.prod.yml build \
  --parallel \
  --progress=plain \
  --build-arg BUILDKIT_INLINE_CACHE=1

echo "✅ Build completed!"

echo ""
echo "📊 Build Summary:"
echo "- Backend:   dob-validator-backend-prod"
echo "- Frontend:  dob-validator-frontend-prod"
echo "- Backoffice: dob-validator-backoffice-prod"
echo ""
echo "🚀 To start the services, run:"
echo "docker compose -f docker-compose.prod.yml up -d" 