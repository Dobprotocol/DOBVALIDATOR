# DOB Protocol - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the DOB Protocol application across different environments. The application consists of multiple components that can be deployed independently or together.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backoffice    │    │   Backend API   │
│   (Next.js)     │    │   (Next.js)     │    │   (Node.js)     │
│   Port: 3000    │    │   Port: 3002    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    └─────────────────┘
```

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **Docker**: 20.x or higher (optional)
- **pnpm**: 8.x or higher
- **Git**: Latest version

### Required Accounts

- **Stellar Testnet Account**: For blockchain interactions
- **Vercel Account**: For frontend deployment (optional)
- **Railway/Render Account**: For backend deployment (optional)
- **Database Provider**: PostgreSQL hosting (Supabase, Railway, etc.)

## Environment Setup

### 1. Local Development Environment

#### Clone Repository

```bash
git clone https://github.com/blessedux/DOBVALIDATOR.git
cd DOBVALIDATOR
```

#### Install Dependencies

```bash
pnpm install
```

#### Environment Variables

Create environment files for each component:

**Backend (.env)**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dobprotocol"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Stellar
STELLAR_NETWORK="testnet"
STELLAR_SECRET_KEY="your-stellar-secret-key"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800

# Server
PORT=3001
NODE_ENV=development
```

**Frontend (.env.local)**

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_STELLAR_NETWORK="testnet"
NEXT_PUBLIC_APP_NAME="DOB Protocol"
```

**Backoffice (.env.local)**

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_STELLAR_NETWORK="testnet"
NEXT_PUBLIC_APP_NAME="DOB Protocol Admin"
```

#### Database Setup

```bash
cd backend
pnpm prisma migrate dev
pnpm prisma generate
pnpm prisma db seed
```

#### Start Development Servers

```bash
# Terminal 1: Backend
cd backend && pnpm dev

# Terminal 2: Frontend
cd frontend && pnpm dev

# Terminal 3: Backoffice
cd backoffice && pnpm dev
```

### 2. Staging Environment

#### Database Setup (Supabase)

1. Create a new Supabase project
2. Get the database connection string
3. Run migrations:

```bash
cd backend
DATABASE_URL="your-supabase-url" pnpm prisma migrate deploy
```

#### Environment Variables

**Backend (Staging)**

```env
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
JWT_SECRET="staging-jwt-secret"
STELLAR_NETWORK="testnet"
STELLAR_SECRET_KEY="staging-stellar-key"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800
PORT=3001
NODE_ENV=staging
```

**Frontend (Staging)**

```env
NEXT_PUBLIC_API_URL="https://api-staging.dobprotocol.com"
NEXT_PUBLIC_STELLAR_NETWORK="testnet"
NEXT_PUBLIC_APP_NAME="DOB Protocol (Staging)"
```

### 3. Production Environment

#### Database Setup (Production)

1. Set up a production PostgreSQL database
2. Configure connection pooling
3. Set up automated backups
4. Run migrations:

```bash
cd backend
DATABASE_URL="your-production-db-url" pnpm prisma migrate deploy
```

#### Environment Variables

**Backend (Production)**

```env
DATABASE_URL="postgresql://username:password@host:5432/dobprotocol"
JWT_SECRET="production-jwt-secret"
STELLAR_NETWORK="testnet"
STELLAR_SECRET_KEY="production-stellar-key"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800
PORT=3001
NODE_ENV=production
CORS_ORIGIN="https://dobprotocol.com,https://admin.dobprotocol.com"
```

**Frontend (Production)**

```env
NEXT_PUBLIC_API_URL="https://api.dobprotocol.com"
NEXT_PUBLIC_STELLAR_NETWORK="testnet"
NEXT_PUBLIC_APP_NAME="DOB Protocol"
```

## Deployment Methods

### 1. Docker Deployment

#### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: dobprotocol
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/dobprotocol
      JWT_SECRET: ${JWT_SECRET}
      STELLAR_NETWORK: testnet
      STELLAR_SECRET_KEY: ${STELLAR_SECRET_KEY}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NEXT_PUBLIC_STELLAR_NETWORK: testnet
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backoffice:
    build: ./backoffice
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NEXT_PUBLIC_STELLAR_NETWORK: testnet
    ports:
      - "3002:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Backend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN pnpm prisma generate

EXPOSE 3001

CMD ["pnpm", "start"]
```

#### Frontend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

#### Deploy with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Vercel Deployment (Frontend/Backoffice)

#### Frontend Deployment

```bash
cd frontend
vercel --prod
```

#### Backoffice Deployment

```bash
cd backoffice
vercel --prod
```

#### Vercel Configuration

**vercel.json** (Frontend)

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.dobprotocol.com",
    "NEXT_PUBLIC_STELLAR_NETWORK": "testnet"
  }
}
```

### 3. Railway Deployment (Backend)

#### Railway Setup

1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

#### Railway Configuration

**railway.json**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 4. Manual Server Deployment

#### Server Requirements

- Ubuntu 20.04+ or CentOS 8+
- 2GB RAM minimum
- 20GB storage
- Node.js 18+
- PostgreSQL 14+

#### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2
sudo npm install -g pm2

# Install nginx
sudo apt install nginx -y
```

#### Application Deployment

```bash
# Clone repository
git clone https://github.com/blessedux/DOBVALIDATOR.git
cd DOBVALIDATOR

# Install dependencies
pnpm install

# Build applications
cd frontend && pnpm build
cd ../backoffice && pnpm build

# Start backend with PM2
cd ../backend
pm2 start ecosystem.config.js

# Start frontend with PM2
cd ../frontend
pm2 start ecosystem.config.js

# Start backoffice with PM2
cd ../backoffice
pm2 start ecosystem.config.js
```

#### Nginx Configuration

**/etc/nginx/sites-available/dobprotocol**

```nginx
server {
    listen 80;
    server_name dobprotocol.com www.dobprotocol.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name admin.dobprotocol.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.dobprotocol.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL/HTTPS Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificates
sudo certbot --nginx -d dobprotocol.com -d www.dobprotocol.com
sudo certbot --nginx -d admin.dobprotocol.com
sudo certbot --nginx -d api.dobprotocol.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### PM2 Monitoring

```bash
# Monitor applications
pm2 monit

# View logs
pm2 logs

# Restart applications
pm2 restart all
```

### Health Checks

```bash
# Backend health check
curl https://api.dobprotocol.com/api/health

# Frontend health check
curl https://dobprotocol.com/api/health
```

### Log Management

```bash
# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View application logs
pm2 logs --lines 100
```

## Backup Strategy

### Database Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/dobprotocol"
mkdir -p $BACKUP_DIR

pg_dump dobprotocol > $BACKUP_DIR/dobprotocol_$DATE.sql
gzip $BACKUP_DIR/dobprotocol_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab
echo "0 2 * * * /usr/local/bin/backup-db.sh" | sudo crontab -
```

### File Upload Backups

```bash
# Backup uploads directory
rsync -av /path/to/uploads/ /var/backups/uploads/
```

## Security Considerations

### Firewall Setup

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Environment Security

- Use strong, unique passwords
- Rotate secrets regularly
- Use environment-specific configurations
- Implement rate limiting
- Enable CORS properly

### Database Security

- Use connection pooling
- Implement row-level security
- Regular security updates
- Encrypted connections

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d dobprotocol
```

#### Application Startup Issues

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs --lines 50

# Restart applications
pm2 restart all
```

#### Nginx Issues

```bash
# Check nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx
```

### Performance Optimization

#### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
```

#### Application Optimization

- Enable gzip compression
- Implement caching strategies
- Optimize images and assets
- Use CDN for static files

## Rollback Procedures

### Application Rollback

```bash
# Revert to previous version
git checkout HEAD~1

# Rebuild and restart
pnpm build
pm2 restart all
```

### Database Rollback

```bash
# Restore from backup
gunzip -c /var/backups/dobprotocol/dobprotocol_20240115_120000.sql.gz | psql dobprotocol
```

## Support and Maintenance

### Regular Maintenance Tasks

- Weekly security updates
- Monthly database maintenance
- Quarterly performance reviews
- Annual security audits

### Monitoring Tools

- PM2 for process management
- Nginx for web server monitoring
- PostgreSQL monitoring
- Application performance monitoring

### Contact Information

- **Technical Support**: [GitHub Issues](https://github.com/blessedux/DOBVALIDATOR/issues)
- **Documentation**: [Technical Documentation](README.md)
- **Community**: [Discord](https://discord.gg/dobprotocol)

## License

This deployment guide is part of the DOB Protocol project and is licensed under the MIT License.
