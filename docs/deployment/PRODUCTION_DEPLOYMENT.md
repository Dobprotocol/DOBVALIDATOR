# Production Deployment Guide

## Overview

This guide covers the production deployment of the DOB Validator application using Docker, Google Cloud Platform, and best practices for scalability and security.

## Prerequisites

### 1. Google Cloud Platform Setup

- Google Cloud Project created
- Cloud SQL instance configured
- Cloud Storage bucket for file uploads
- Service account with necessary permissions
- Cloud SQL Proxy configured

### 2. Domain & SSL

- Domain name registered
- SSL certificates (Let's Encrypt or Cloud SSL)
- DNS configuration ready

### 3. Environment Variables

- Production database credentials
- JWT secret keys
- Stellar network configuration
- File storage configuration

## Docker Configuration

### Services Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │    │ Backoffice  │    │  Backend    │
│  (Next.js)  │    │  (Next.js)  │    │  (Express)  │
│  Port:3000  │    │  Port:3000  │    │  Port:3001  │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                   │
      └──────────┬──────┴───────────┬───────┘
                 │                  │
         ┌───────┴──────┐   ┌──────┴───────┐
         │    Nginx     │   │  Cloud SQL    │
         │   Reverse    │   │    Proxy      │
         │    Proxy     │   │   Port:5433   │
         └──────────────┘   └──────────────┘
```

### Service Details

#### Frontend & Backoffice

- Next.js applications
- Optimized Docker builds
- Health checks enabled
- Non-root execution

#### Backend

- Express API server
- Prisma ORM
- File upload handling
- Health monitoring

#### Nginx

- SSL/TLS termination
- Reverse proxy
- Path-based routing
- Security headers

## Deployment Steps

1. Environment Setup

```bash
# Copy environment template
cp .env.example .env.production

# Edit production environment
nano .env.production
```

2. SSL Certificate Setup

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy certificates
cp cert.pem nginx/ssl/
cp key.pem nginx/ssl/
```

3. Database Migration

```bash
# Run migrations
pnpm prisma migrate deploy
```

4. Build and Deploy

```bash
# Build services
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d
```

## Health Checks

Verify all services are running:

- Frontend: http://localhost:3000
- Backoffice: http://localhost:3000/admin
- Backend: http://localhost:3001/health

## Monitoring

- Check application logs
- Monitor system resources
- Review error tracking
- Check performance metrics

## Rollback Procedure

If deployment fails:

```bash
# Stop services
docker compose -f docker-compose.prod.yml down

# Restore database if needed
# Your restore command here

# Deploy previous version
git checkout <previous-tag>
docker compose -f docker-compose.prod.yml up -d
```

## Security Notes

1. File Permissions

   - Ensure proper ownership
   - Restrict access to sensitive files

2. Network Security

   - Configure firewalls
   - Set up rate limiting
   - Enable CORS properly

3. Database Security
   - Regular backups
   - Access control
   - Connection encryption

## Maintenance

### Regular Tasks

- Monitor system resources
- Check application logs
- Review security updates
- Backup database regularly
- Update SSL certificates before expiry

### Troubleshooting

- Check container logs
- Verify network connectivity
- Review error logs
- Check resource usage
