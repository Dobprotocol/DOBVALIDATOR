#!/bin/bash

# Database Migration Script for Google Cloud SQL
# Run this after getting DevOps permissions and Cloud SQL Proxy is working

set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "🔄 Starting database migration process..."

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
  echo "⚠️  Production environment detected"
  read -p "Are you sure you want to run migrations in production? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 1
  fi
fi

# Create backup if in production
if [ "$NODE_ENV" = "production" ]; then
  echo "📦 Creating database backup..."
  BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
  pg_dump "$DATABASE_URL" > "backups/$BACKUP_FILE"
  echo "✅ Backup created: $BACKUP_FILE"
fi

# Run migrations
echo "🚀 Running database migrations..."
cd backend
npx prisma migrate deploy

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

echo "✅ Database migration completed successfully!"

# Additional checks in production
if [ "$NODE_ENV" = "production" ]; then
  echo "🔍 Running post-migration checks..."
  
  # Check database connection
  echo "  - Checking database connection..."
  npx prisma db seed
  
  # Verify migrations
  echo "  - Verifying migrations..."
  npx prisma migrate status
  
  echo "✅ All post-migration checks passed"
fi

# Required environment variables
required_vars=(
    "DB_PASSWORD"
    "DB_USER"
    "DB_NAME"
    "GOOGLE_CLOUD_PROJECT"
    "GOOGLE_CLOUD_REGION"
    "DB_INSTANCE_NAME"
)

# Check for required environment variables
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: Required environment variable $var is not set"
        exit 1
    fi
done

echo "🚀 Starting Database Migration to Google Cloud SQL..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Cloud SQL Proxy is running
echo -e "${YELLOW}Checking Cloud SQL Proxy status...${NC}"
if ! docker ps | grep -q cloud-sql-proxy; then
    echo -e "${RED}Cloud SQL Proxy is not running. Starting it...${NC}"
    docker run -d --name cloud-sql-proxy -p 5433:5432 \
        -v $(pwd)/keys:/keys \
        gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.8.1 \
        --credentials-file=/keys/service-account.json \
        ${GOOGLE_CLOUD_PROJECT}:${GOOGLE_CLOUD_REGION}:${DB_INSTANCE_NAME}
    
    echo -e "${YELLOW}Waiting for proxy to start...${NC}"
    sleep 10
fi

# Check if export file exists
if [ ! -f "dob_validator_export.sql" ]; then
    echo -e "${RED}Error: dob_validator_export.sql not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Cloud SQL Proxy is running${NC}"
echo -e "${GREEN}✓ Export file found${NC}"

# Test connection
echo -e "${YELLOW}Testing database connection...${NC}"
if ! PGPASSWORD="${DB_PASSWORD}" psql -h localhost -p 5433 -U "${DB_USER}" -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to Google Cloud SQL${NC}"
    echo -e "${YELLOW}Please check:${NC}"
    echo -e "  1. DevOps has granted Cloud SQL Client permissions"
    echo -e "  2. Service account JSON is correct"
    echo -e "  3. Cloud SQL Proxy is running"
    exit 1
fi

echo -e "${GREEN}✓ Database connection successful${NC}"

# Create database if it doesn't exist
echo -e "${YELLOW}Creating database if it doesn't exist...${NC}"
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -p 5433 -U "${DB_USER}" -d postgres -c "CREATE DATABASE IF NOT EXISTS \"${DB_NAME}\";"

# Import the data
echo -e "${YELLOW}Importing database schema and data...${NC}"
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -p 5433 -U "${DB_USER}" -d "${DB_NAME}" -f dob_validator_export.sql

echo -e "${GREEN}✓ Database migration completed successfully!${NC}"

# Verify migration
echo -e "${YELLOW}Verifying migration...${NC}"
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -p 5433 -U "${DB_USER}" -d "${DB_NAME}" -c "
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"

echo -e "${GREEN}🎉 Migration completed! You can now connect with DBeaver:${NC}"
echo -e "  Host: localhost"
echo -e "  Port: 5433"
echo -e "  Database: ${DB_NAME}"
echo -e "  Username: ${DB_USER}"
echo -e "  Password: <stored in .env.prod>" 