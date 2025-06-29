#!/bin/bash

# Development Docker Build Script for DOB Validator
# This script is optimized for faster development builds

set -e

echo "🔧 Starting development Docker build for DOB Validator..."

# Enable Docker BuildKit for better caching and parallel builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build arguments for development
BUILD_ARGS="--build-arg BUILDKIT_INLINE_CACHE=1 --build-arg NODE_ENV=development"

echo "📦 Building development images with BuildKit enabled..."

# Build all services in parallel with development optimizations
docker compose -f docker-compose.yml build \
  --parallel \
  --no-cache=false \
  --progress=plain \
  $BUILD_ARGS \
  backend frontend backoffice

echo "✅ Development build completed successfully!"
echo ""
echo "📊 Build Summary:"
echo "- Backend:   dob-validator-backend"
echo "- Frontend:  dob-validator-frontend"
echo "- Backoffice: dob-validator-backoffice"
echo ""
echo "🚀 To start the development services, run:"
echo "docker compose up -d" 