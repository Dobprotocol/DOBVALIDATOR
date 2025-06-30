#!/bin/bash

# Exit on error
set -e

# Set default environment variables
export DB_USER=${DB_USER:-dob_user}
export DB_PASSWORD=${DB_PASSWORD:-dob_password}
export DB_NAME=${DB_NAME:-dob_validator}
export JWT_SECRET=${JWT_SECRET:-this-is-a-development-jwt-secret-that-is-at-least-32-chars}
export JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-24h}
export FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}
export BACKEND_URL=${BACKEND_URL:-http://localhost:3001}
export BACKOFFICE_URL=${BACKOFFICE_URL:-http://localhost:3002}
export CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:3000}

# Create temporary .env file
echo "📝 Creating temporary .env file..."
cat > docker/.env.production << EOF
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
FRONTEND_URL=${FRONTEND_URL}
BACKEND_URL=${BACKEND_URL}
BACKOFFICE_URL=${BACKOFFICE_URL}
CORS_ORIGIN=${CORS_ORIGIN}
EOF

echo "🚀 Testing backend in isolation..."

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker compose -f docker/docker-compose.prod.yml down

# Remove existing network if it exists
echo "🔄 Setting up network..."
docker network rm dob_network || true
docker network create dob_network

# Start PostgreSQL first
echo "📦 Starting PostgreSQL..."
docker compose -f docker/docker-compose.prod.yml up db -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker compose -f docker/docker-compose.prod.yml exec db pg_isready -U ${DB_USER} -d ${DB_NAME}; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

# Build backend
echo "🏗️ Building backend..."
docker compose -f docker/docker-compose.prod.yml build backend

# Run database migrations
echo "🔄 Running database migrations..."
cd backend
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public" pnpm prisma migrate deploy
cd ..

# Start backend
echo "🚀 Starting backend..."
docker compose -f docker/docker-compose.prod.yml up backend -d

# Wait for backend to be healthy
echo "⏳ Waiting for backend to be healthy..."
until curl -f http://localhost:3001/health; do
  echo "Backend is unavailable - sleeping"
  sleep 1
done

echo "✅ Backend is running and healthy!"
echo "📝 Checking logs..."
docker compose -f docker/docker-compose.prod.yml logs backend --tail 100

echo "
🔍 Test the following endpoints:
- Health check: curl http://localhost:3001/health
- Auth challenge: curl -X POST -H \"Content-Type: application/json\" -d '{\"walletAddress\":\"test123\"}' http://localhost:3001/api/auth/challenge
- Other endpoints: Add your test commands here

To stop the services:
docker compose -f docker/docker-compose.prod.yml down

Cleanup:
rm docker/.env.production" 