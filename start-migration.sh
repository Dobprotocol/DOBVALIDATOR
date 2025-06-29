#!/bin/bash

# DOB Validator - Migration to Google Cloud Quick Start Script
# This script helps you get started with the migration process

set -e

echo "🚀 DOB Validator - Migration to Google Cloud"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if required files exist
check_files() {
    print_status "Checking required files..."
    
    local missing_files=()
    
    if [ ! -f "frontend/Dockerfile" ]; then
        missing_files+=("frontend/Dockerfile")
    fi
    
    if [ ! -f "backoffice/Dockerfile" ]; then
        missing_files+=("backoffice/Dockerfile")
    fi
    
    if [ ! -f "backend/Dockerfile" ]; then
        missing_files+=("backend/Dockerfile")
    fi
    
    if [ ! -f "docker-compose.dev.yml" ]; then
        missing_files+=("docker-compose.dev.yml")
    fi
    
    if [ ! -f "docker-compose.prod.yml" ]; then
        missing_files+=("docker-compose.prod.yml")
    fi
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        print_error "Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        exit 1
    fi
    
    print_success "All required files are present"
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Create .env.dev if it doesn't exist
    if [ ! -f ".env.dev" ]; then
        cat > .env.dev << EOF
# Development Environment Variables
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dob_validator_dev

# JWT
JWT_SECRET=dev_jwt_secret_key_change_in_production

# App URLs
FRONTEND_URL=http://localhost:3000
BACKOFFICE_URL=http://localhost:3001
BACKEND_URL=http://localhost:3005

# Google Cloud (for production migration)
# GCP_PROJECT_ID=your-project-id
# GCP_INSTANCE_CONNECTION_NAME=your-project:region:instance-name
EOF
        print_success "Created .env.dev"
    else
        print_warning ".env.dev already exists"
    fi
    
    # Create .env.prod if it doesn't exist
    if [ ! -f ".env.prod" ]; then
        cat > .env.prod << EOF
# Production Environment Variables
NODE_ENV=production

# Database (Google Cloud SQL)
DATABASE_URL=postgresql://user:password@google-cloud-sql/dob_validator_prod

# JWT (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=production_jwt_secret_key_change_this

# App URLs (Update with your domain)
FRONTEND_URL=https://your-domain.com
BACKOFFICE_URL=https://admin.your-domain.com
BACKEND_URL=https://api.your-domain.com

# Google Cloud
GCP_PROJECT_ID=your-project-id
GCP_INSTANCE_CONNECTION_NAME=your-project:region:instance-name
EOF
        print_success "Created .env.prod"
    else
        print_warning ".env.prod already exists"
    fi
}

# Test Docker builds
test_docker_builds() {
    print_status "Testing Docker builds..."
    
    # Test frontend build
    print_status "Building frontend..."
    if docker build -t dob-frontend-test ./frontend; then
        print_success "Frontend build successful"
    else
        print_error "Frontend build failed"
        return 1
    fi
    
    # Test backoffice build
    print_status "Building backoffice..."
    if docker build -t dob-backoffice-test ./backoffice; then
        print_success "Backoffice build successful"
    else
        print_error "Backoffice build failed"
        return 1
    fi
    
    # Test backend build
    print_status "Building backend..."
    if docker build -t dob-backend-test ./backend; then
        print_success "Backend build successful"
    else
        print_error "Backend build failed"
        return 1
    fi
    
    # Clean up test images
    docker rmi dob-frontend-test dob-backoffice-test dob-backend-test 2>/dev/null || true
}

# Show next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "==========="
    echo ""
    echo "1. 📊 Database Setup:"
    echo "   - Set up Google Cloud SQL instance"
    echo "   - Install Cloud SQL Proxy"
    echo "   - Test connection via localhost:5433"
    echo ""
    echo "2. 🔧 Environment Configuration:"
    echo "   - Update .env.dev with your local database settings"
    echo "   - Update .env.prod with your Google Cloud settings"
    echo ""
    echo "3. 🐳 Development Testing:"
    echo "   docker-compose -f docker-compose.dev.yml up --build"
    echo ""
    echo "4. 📋 Follow the complete TODO list:"
    echo "   cat MIGRATION_TO_GOOGLE_CLOUD_TODO.md"
    echo ""
    echo "5. 🔗 Useful commands:"
    echo "   # Start development environment"
    echo "   docker-compose -f docker-compose.dev.yml up --build"
    echo ""
    echo "   # Stop development environment"
    echo "   docker-compose -f docker-compose.dev.yml down"
    echo ""
    echo "   # View logs"
    echo "   docker-compose -f docker-compose.dev.yml logs -f"
    echo ""
    echo "   # Test individual containers"
    echo "   docker build -t dob-frontend ./frontend"
    echo "   docker run -p 3000:3000 dob-frontend"
    echo ""
}

# Main execution
main() {
    echo "Starting migration setup..."
    echo ""
    
    check_docker
    check_files
    create_env_files
    
    echo ""
    print_status "Testing Docker builds (this may take a few minutes)..."
    if test_docker_builds; then
        print_success "All Docker builds passed!"
    else
        print_error "Some Docker builds failed. Please check the errors above."
        exit 1
    fi
    
    show_next_steps
}

# Run main function
main "$@" 