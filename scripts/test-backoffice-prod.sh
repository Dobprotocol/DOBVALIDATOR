#!/bin/bash

# Exit on any error
set -e

echo "🔍 Testing DOB Validator Backoffice Production Setup..."

# Build the backoffice image
echo "📦 Building backoffice Docker image..."
docker build -t dob-validator-backoffice-prod -f backoffice/Dockerfile .

# Create test network if it doesn't exist
docker network inspect dob_network >/dev/null 2>&1 || \
    docker network create dob_network

# Run the backoffice container
echo "🚀 Starting backoffice container..."
docker run -d \
    --name dob-validator-backoffice-test \
    --network dob_network \
    -p 3002:3002 \
    -e NODE_ENV=production \
    -e PORT=3002 \
    -e HOSTNAME=0.0.0.0 \
    -e NEXT_PUBLIC_BACKEND_URL=http://localhost:3001 \
    -e NEXT_PUBLIC_STELLAR_NETWORK=testnet \
    -e NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org \
    dob-validator-backoffice-prod

# Wait for container to be healthy
echo "⏳ Waiting for backoffice to be ready..."
for i in {1..30}; do
    if [ "$(docker inspect -f {{.State.Health.Status}} dob-validator-backoffice-test)" = "healthy" ]; then
        echo "✅ Backoffice is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backoffice failed to become healthy"
        docker logs dob-validator-backoffice-test
        exit 1
    fi
    sleep 2
done

# Test health endpoint
echo "🏥 Testing health endpoint..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/health)
if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo "✅ Health endpoint is working"
else
    echo "❌ Health endpoint failed with status $HEALTH_STATUS"
    docker logs dob-validator-backoffice-test
    exit 1
fi

# Test static asset loading
echo "🖼️ Testing static asset loading..."
STATIC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/_next/static/chunks/pages/index.js)
if [ "$STATIC_STATUS" -eq 200 ]; then
    echo "✅ Static assets are loading correctly"
else
    echo "❌ Static assets failed to load with status $STATIC_STATUS"
    docker logs dob-validator-backoffice-test
    exit 1
fi

# Cleanup
echo "🧹 Cleaning up test container..."
docker stop dob-validator-backoffice-test
docker rm dob-validator-backoffice-test

echo "✨ All backoffice tests passed successfully!" 