#!/bin/bash

# Production Deployment Script for DOB Validator
# Usage: ./deploy-production.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
PROJECT_NAME="dob-validator"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

log "🚀 Starting Production Deployment for DOB Validator"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
   exit 1
fi

# Check prerequisites
log "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    error "Environment file $ENV_FILE not found!"
    log "Please copy env.production.example to $ENV_FILE and configure it:"
    log "cp env.production.example $ENV_FILE"
    log "Then edit $ENV_FILE with your production values"
    exit 1
fi

success "Prerequisites check passed"

# Load environment variables
log "Loading environment variables..."
source "$ENV_FILE"

# Validate required environment variables
required_vars=("DATABASE_URL" "JWT_SECRET" "FRONTEND_URL" "BACKOFFICE_URL" "BACKEND_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        error "Required environment variable $var is not set in $ENV_FILE"
        exit 1
    fi
done

success "Environment variables validated"

# Create necessary directories
log "Creating necessary directories..."
mkdir -p uploads/pdfs
mkdir -p uploads/temp
mkdir -p nginx/ssl
mkdir -p logs

success "Directories created"

# Set proper permissions
log "Setting proper permissions..."
chmod 755 uploads
chmod 755 uploads/pdfs
chmod 755 uploads/temp
chmod 644 "$ENV_FILE"

success "Permissions set"

# Stop any existing containers
log "Stopping existing containers..."
docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans || true

success "Existing containers stopped"

# Build images
log "Building Docker images..."
docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache

success "Docker images built"

# Start services
log "Starting services..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

success "Services started"

# Wait for services to be ready
log "Waiting for services to be ready..."
sleep 30

# Check service health
log "Checking service health..."

# Check backend health
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -f -s "$BACKEND_URL/health" > /dev/null; then
        success "Backend is healthy"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        error "Backend health check failed after $max_attempts attempts"
        log "Checking backend logs..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs backend
        exit 1
    fi
    
    log "Backend not ready yet, attempt $attempt/$max_attempts"
    sleep 10
    ((attempt++))
done

# Check frontend
if curl -f -s "$FRONTEND_URL" > /dev/null; then
    success "Frontend is accessible"
else
    error "Frontend is not accessible"
    log "Checking frontend logs..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs frontend
fi

# Check backoffice
if curl -f -s "$BACKOFFICE_URL" > /dev/null; then
    success "Backoffice is accessible"
else
    error "Backoffice is not accessible"
    log "Checking backoffice logs..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs backoffice
fi

# Run database migrations
log "Running database migrations..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T backend npx prisma migrate deploy

success "Database migrations completed"

# Run production tests
log "Running production tests..."
if command -v node &> /dev/null; then
    # Install test dependencies if needed
    if [ ! -d "node_modules" ]; then
        log "Installing test dependencies..."
        npm install axios
    fi
    
    # Run tests
    BASE_URL="http://localhost" node test-production-setup.js
else
    warning "Node.js not available, skipping automated tests"
    log "Please run the tests manually:"
    log "npm install axios"
    log "BASE_URL=http://localhost node test-production-setup.js"
fi

# Show service status
log "Service status:"
docker-compose -f "$DOCKER_COMPOSE_FILE" ps

# Show logs summary
log "Recent logs summary:"
docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=20

# Final instructions
log "🎉 Production deployment completed!"
log ""
log "📋 Next steps:"
log "1. Configure your domain DNS to point to this server"
log "2. Set up SSL certificates in nginx/ssl/"
log "3. Update nginx configuration for your domain"
log "4. Test the complete user flow:"
log "   - Frontend: $FRONTEND_URL"
log "   - Backoffice: $BACKOFFICE_URL"
log "   - API: $BACKEND_URL"
log ""
log "🔧 Useful commands:"
log "  View logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
log "  Stop services: docker-compose -f $DOCKER_COMPOSE_FILE down"
log "  Restart services: docker-compose -f $DOCKER_COMPOSE_FILE restart"
log "  Update and redeploy: ./deploy-production.sh"
log ""
log "📊 Monitoring:"
log "  Health check: curl $BACKEND_URL/health"
log "  Service status: docker-compose -f $DOCKER_COMPOSE_FILE ps"
log ""
success "Production deployment ready for Google Cloud!" 