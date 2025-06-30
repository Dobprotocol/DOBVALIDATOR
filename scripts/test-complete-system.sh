#!/bin/bash

# Exit on any error
set -e

echo "🔍 Testing Complete DOB Validator System..."

# Create network if it doesn't exist
echo "🌐 Setting up Docker network..."
docker network inspect dob_network >/dev/null 2>&1 || \
    docker network create dob_network

# Start PostgreSQL
echo "📦 Starting PostgreSQL..."
docker run -d \
    --name dob-validator-db-test \
    --network dob_network \
    -e POSTGRES_USER=dobuser \
    -e POSTGRES_PASSWORD=dobpass \
    -e POSTGRES_DB=dobvalidator \
    postgres:15-alpine

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker exec dob-validator-db-test pg_isready -U dobuser -d dobvalidator; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL failed to start"
        exit 1
    fi
    sleep 2
done

# Start Backend
echo "🚀 Starting Backend..."
docker run -d \
    --name dob-validator-backend-test \
    --network dob_network \
    -p 3001:3001 \
    -e NODE_ENV=production \
    -e PORT=3001 \
    -e DATABASE_URL="postgresql://dobuser:dobpass@dob-validator-db-test:5432/dobvalidator?schema=public" \
    -e JWT_SECRET=test_secret \
    -e JWT_EXPIRES_IN=1h \
    -e STELLAR_NETWORK=testnet \
    -e STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org \
    -e CORS_ORIGIN="http://localhost:3000,http://localhost:3002" \
    dob-validator-backend-prod

# Start Backoffice
echo "🚀 Starting Backoffice..."
docker run -d \
    --name dob-validator-backoffice-test \
    --network dob_network \
    -p 3002:3002 \
    -e NODE_ENV=production \
    -e PORT=3002 \
    -e NEXT_PUBLIC_BACKEND_URL=http://localhost:3001 \
    -e NEXT_PUBLIC_STELLAR_NETWORK=testnet \
    -e NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org \
    dob-validator-backoffice-prod

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
for service in dob-validator-backend-test dob-validator-backoffice-test; do
    for i in {1..30}; do
        if [ "$(docker inspect -f {{.State.Health.Status}} $service)" = "healthy" ]; then
            echo "✅ $service is healthy!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ $service failed to become healthy"
            docker logs $service
            exit 1
        fi
        sleep 2
    done
done

# Test Backend Health
echo "🏥 Testing Backend health..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
if [ "$BACKEND_HEALTH" -eq 200 ]; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed with status $BACKEND_HEALTH"
    exit 1
fi

# Test Backoffice Health
echo "🏥 Testing Backoffice health..."
BACKOFFICE_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/health)
if [ "$BACKOFFICE_HEALTH" -eq 200 ]; then
    echo "✅ Backoffice health check passed"
else
    echo "❌ Backoffice health check failed with status $BACKOFFICE_HEALTH"
    exit 1
fi

# Test Backend-Backoffice Integration
echo "🔄 Testing Backend-Backoffice Integration..."
# Create a test JWT token
TEST_TOKEN=$(curl -s -X POST http://localhost:3001/auth/challenge \
    -H "Content-Type: application/json" \
    -d '{"publicKey": "GBXE3DYFUQGEWBQAM5XPJQNZWZJ6QNRRIXQT5RLG2OQNQVFJSD6HWEUC"}' \
    | jq -r '.token')

if [ -n "$TEST_TOKEN" ]; then
    echo "✅ Authentication challenge successful"
else
    echo "❌ Authentication challenge failed"
    exit 1
fi

# Test profile retrieval through backoffice
PROFILE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $TEST_TOKEN" \
    http://localhost:3002/api/profile)

if [ "$PROFILE_STATUS" -eq 200 ] || [ "$PROFILE_STATUS" -eq 404 ]; then
    echo "✅ Profile API integration test passed"
else
    echo "❌ Profile API integration test failed with status $PROFILE_STATUS"
    exit 1
fi

# Cleanup
echo "🧹 Cleaning up test containers..."
docker stop dob-validator-db-test dob-validator-backend-test dob-validator-backoffice-test
docker rm dob-validator-db-test dob-validator-backend-test dob-validator-backoffice-test

echo "✨ Complete system test passed successfully!" 