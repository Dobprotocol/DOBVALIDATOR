#!/bin/bash

# Production Build Script for DOB Validator
# This script builds production-ready Docker images

set -e

echo "🚀 Building Production Docker Images..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

echo -e "${YELLOW}Building Frontend...${NC}"
docker build -f frontend/Dockerfile -t dob-validator-frontend:latest .

echo -e "${YELLOW}Building Backoffice...${NC}"
docker build -f backoffice/Dockerfile -t dob-validator-backoffice:latest .

echo -e "${YELLOW}Building Backend...${NC}"
docker build -f backend/Dockerfile -t dob-validator-backend:latest .

echo -e "${GREEN}✅ All production images built successfully!${NC}"

# List built images
echo -e "${YELLOW}Built Images:${NC}"
docker images | grep dob-validator

echo -e "${GREEN}🎉 Production build completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Run: docker-compose -f docker-compose.prod.google-cloud.yml up -d"
echo -e "  2. Or deploy to your production server" 