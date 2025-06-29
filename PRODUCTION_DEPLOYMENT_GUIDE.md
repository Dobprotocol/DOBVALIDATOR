# 🚀 Production Deployment Guide

## Overview

This guide covers the production deployment of the DOB Validator application using Docker, Google Cloud Platform, and best practices for scalability and security.

## 📋 Prerequisites

### 1. Google Cloud Platform Setup

- [ ] Google Cloud Project created
- [ ] Cloud SQL instance configured
- [ ] Cloud Storage bucket for file uploads
- [ ] Service account with necessary permissions
- [ ] Cloud SQL Proxy configured

### 2. Domain & SSL

- [ ] Domain name registered
- [ ] SSL certificates (Let's Encrypt or Cloud SSL)
- [ ] DNS configuration ready

### 3. Environment Variables

- [ ] Production database credentials
- [ ] JWT secret keys
- [ ] Stellar network configuration
- [ ] File storage configuration

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backoffice    │    │    Backend      │
│   (Next.js)     │    │   (Next.js)     │    │   (Express)     │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 3005    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Nginx       │
                    │   (Reverse      │
                    │    Proxy)       │
                    │   Port: 80/443  │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Google Cloud   │
                    │      SQL        │
                    │   (PostgreSQL)  │
                    └─────────────────┘
```

## 🐳 Docker Production Setup

### 1. Production Docker Compose

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/sites-enabled:/etc/nginx/sites-enabled
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backoffice
      - backend

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - BACKOFFICE_URL=${BACKOFFICE_URL}
      - BACKEND_URL=${BACKEND_URL}
    volumes:
      - ./uploads:/app/uploads

  backoffice:
    build:
      context: .
      dockerfile: backoffice/Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - BACKOFFICE_URL=${BACKOFFICE_URL}
      - BACKEND_URL=${BACKEND_URL}
    volumes:
      - ./uploads:/app/uploads

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - BACKOFFICE_URL=${BACKOFFICE_URL}
      - BACKEND_URL=${BACKEND_URL}
    volumes:
      - ./uploads:/app/uploads
```

### 2. Production Dockerfiles

#### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
RUN npm install -g pnpm
RUN pnpm install
COPY . .
WORKDIR /app/frontend
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]
```

#### Backend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
RUN npm install -g pnpm
RUN pnpm install
COPY . .
WORKDIR /app/backend
RUN npx prisma generate

FROM node:18-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/shared ./shared
USER backend
EXPOSE 3005
ENV PORT 3005
ENV HOSTNAME "0.0.0.0"
CMD ["node", "backend/dist/index.js"]
```

### 3. Nginx Configuration

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backoffice {
        server backoffice:3000;
    }

    upstream backend {
        server backend:3005;
    }

    server {
        listen 80;
        server_name your-domain.com;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backoffice
        location /admin {
            proxy_pass http://backoffice;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://backend/health;
        }
    }
}
```

## 🔧 Environment Configuration

### 1. Production Environment Variables

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dob_validator
JWT_SECRET=your-super-secret-production-jwt-key
JWT_EXPIRES_IN=7d

# Stellar Configuration
STELLAR_NETWORK=public
STELLAR_HORIZON_URL=https://horizon.stellar.org

# File Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Server Configuration
PORT=3005
CORS_ORIGIN=https://your-domain.com

# URLs
FRONTEND_URL=https://your-domain.com
BACKOFFICE_URL=https://your-domain.com/admin
BACKEND_URL=https://your-domain.com/api
```

### 2. Google Cloud SQL Configuration

```bash
# Connect to Cloud SQL
gcloud sql connect dob-validator --user=postgres

# Create database and user
CREATE DATABASE dob_validator;
CREATE USER dob_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE dob_validator TO dob_user;
```

## 🚀 Deployment Steps

### 1. Build and Deploy

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Deploy to production
docker compose -f docker-compose.prod.yml up -d

# Run database migrations
docker exec -it dobvalidator-backend-1 npx prisma migrate deploy
```

### 2. SSL Configuration

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Monitoring Setup

```bash
# Install monitoring tools
docker run -d \
  --name=prometheus \
  -p 9090:9090 \
  prom/prometheus

docker run -d \
  --name=grafana \
  -p 3000:3000 \
  grafana/grafana
```

## 🔒 Security Checklist

### 1. Network Security

- [ ] Firewall rules configured
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled

### 2. Application Security

- [ ] JWT secrets rotated
- [ ] Database passwords strong
- [ ] Input validation implemented
- [ ] SQL injection prevention

### 3. Infrastructure Security

- [ ] Service accounts with minimal permissions
- [ ] Secrets management (Secret Manager)
- [ ] Regular security updates
- [ ] Backup strategy implemented

## 📊 Monitoring & Logging

### 1. Application Logs

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Log rotation
docker run -d \
  --name logrotate \
  -v /var/lib/docker/containers:/var/lib/docker/containers \
  -v /var/log:/var/log \
  logrotate
```

### 2. Health Checks

```bash
# Monitor health endpoints
curl https://your-domain.com/health
curl https://your-domain.com/api/health
```

### 3. Performance Monitoring

- [ ] Set up Google Cloud Monitoring
- [ ] Configure alerts for downtime
- [ ] Monitor database performance
- [ ] Track API response times

## 🔄 CI/CD Pipeline

### 1. GitHub Actions Workflow

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build and push Docker images
        run: |
          docker build -t your-registry/frontend:${{ github.sha }} -f frontend/Dockerfile .
          docker build -t your-registry/backoffice:${{ github.sha }} -f backoffice/Dockerfile .
          docker build -t your-registry/backend:${{ github.sha }} -f backend/Dockerfile .

      - name: Deploy to production
        run: |
          ssh user@server "cd /app && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d"
```

## 🎯 Post-Deployment Checklist

### 1. Functionality Tests

- [ ] Frontend loads correctly
- [ ] Backoffice accessible
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] File uploads functional

### 2. Performance Tests

- [ ] Load testing completed
- [ ] Response times acceptable
- [ ] Database queries optimized
- [ ] Memory usage monitored

### 3. Security Tests

- [ ] Penetration testing
- [ ] SSL certificate valid
- [ ] Authentication working
- [ ] Authorization enforced

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**: Check Cloud SQL Proxy and credentials
2. **SSL Issues**: Verify certificate installation
3. **Container Crashes**: Check logs and resource limits
4. **Performance**: Monitor resource usage and optimize

### Emergency Procedures

1. **Rollback**: `docker compose -f docker-compose.prod.yml down && git checkout previous-version`
2. **Database Backup**: `pg_dump` before major changes
3. **Monitoring**: Set up alerts for critical failures

---

## 📞 Support

For deployment issues:

1. Check logs: `docker compose logs -f`
2. Verify environment variables
3. Test database connectivity
4. Review security configurations

**Production URL**: https://your-domain.com
**Admin Panel**: https://your-domain.com/admin
**API Documentation**: https://your-domain.com/api/docs
