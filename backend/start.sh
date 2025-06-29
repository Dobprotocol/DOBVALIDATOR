#!/bin/sh

# Wait for database to be ready
echo "🔄 Waiting for database to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "✅ Database is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy
echo "✅ Database migrations completed!"

# Start the application
echo "🚀 Starting backend server..."
exec node dist/index.js 