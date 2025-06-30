#!/bin/bash

# Exit on any error
set -e

echo "🔍 Testing DOB Validator Frontend Production Setup..."

# Build the frontend image
echo "📦 Building frontend Docker image..."
docker build -t dob-validator-frontend-prod -f frontend/Dockerfile .

# Create test network if it doesn't exist
docker network inspect dob_network >/dev/null 2>&1 || \
    docker network create dob_network

# Run the frontend container
echo "🚀 Starting frontend container..."
docker run -d \
    --name dob-validator-frontend-test \
    --network dob_network \
    -p 3000:3000 \
    -e NODE_ENV=production \
    -e PORT=3000 \
    -e HOSTNAME=0.0.0.0 \
    -e NEXT_PUBLIC_BACKEND_URL=http://localhost:3001 \
    -e NEXT_PUBLIC_STELLAR_NETWORK=testnet \
    -e NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org \
    dob-validator-frontend-prod

# Wait for container to be healthy
echo "⏳ Waiting for frontend to be ready..."
for i in {1..30}; do
    if [ "$(docker inspect -f {{.State.Health.Status}} dob-validator-frontend-test)" = "healthy" ]; then
        echo "✅ Frontend is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Frontend failed to become healthy"
        docker logs dob-validator-frontend-test
        exit 1
    fi
    sleep 2
done

# Test health endpoint
echo "🏥 Testing health endpoint..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo "✅ Health endpoint is working"
else
    echo "❌ Health endpoint failed with status $HEALTH_STATUS"
    docker logs dob-validator-frontend-test
    exit 1
fi

# Test static asset loading
echo "🖼️ Testing static asset loading..."
STATIC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/_next/static/chunks/pages/index.js)
if [ "$STATIC_STATUS" -eq 200 ]; then
    echo "✅ Static assets are loading correctly"
else
    echo "❌ Static assets failed to load with status $STATIC_STATUS"
    docker logs dob-validator-frontend-test
    exit 1
fi

# Cleanup
echo "🧹 Cleaning up test container..."
docker stop dob-validator-frontend-test
docker rm dob-validator-frontend-test

echo "✨ All frontend tests passed successfully!" 