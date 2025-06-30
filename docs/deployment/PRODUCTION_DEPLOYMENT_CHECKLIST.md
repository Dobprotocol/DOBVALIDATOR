# Production Deployment Checklist

## Pre-Deployment Steps

### Environment Setup

- [ ] Run `scripts/setup-env.sh` to create environment files
- [ ] Update the following in `.env`:
  - [ ] Set secure `JWT_SECRET`
  - [ ] Configure `STELLAR_CONTRACT_ID`
  - [ ] Set proper database credentials
  - [ ] Update service URLs for your domain
  - [ ] Verify `NODE_ENV=production`

### Database

- [ ] Run database migrations: `pnpm prisma migrate deploy`
- [ ] Verify database connection string in `.env`
- [ ] Backup existing database if updating

### Docker Configuration

- [ ] Verify all Dockerfiles exist:
  - [ ] `docker/frontend.Dockerfile`
  - [ ] `docker/backoffice.Dockerfile`
  - [ ] `docker/backend.Dockerfile`
- [ ] Check docker-compose.prod.yml configurations
- [ ] Ensure proper port mappings
- [ ] Verify volume mounts

## Deployment Steps

### Build and Deploy

1. Build production images:

   ```bash
   docker compose -f docker-compose.prod.yml build
   ```

2. Start services:

   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

3. Verify services:
   - [ ] Frontend accessible
   - [ ] Backoffice accessible
   - [ ] Backend API responding
   - [ ] Database connected

### Post-Deployment Verification

#### Frontend

- [ ] Test user authentication
- [ ] Verify Stellar wallet integration
- [ ] Check file uploads
- [ ] Test form submissions
- [ ] Verify API connections

#### Backoffice

- [ ] Test admin login
- [ ] Verify submission review process
- [ ] Check dashboard metrics
- [ ] Test user management

#### Backend

- [ ] Verify API endpoints
- [ ] Check JWT authentication
- [ ] Test Stellar contract integration
- [ ] Monitor logs for errors

### Security Checks

- [ ] SSL/TLS certificates installed
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API rate limiting enabled
- [ ] CORS properly configured

### Monitoring Setup

- [ ] Set up logging
- [ ] Configure error tracking
- [ ] Enable performance monitoring
- [ ] Set up alerts

## Rollback Plan

### Quick Rollback Steps

1. Stop new services:

   ```bash
   docker compose -f docker-compose.prod.yml down
   ```

2. Restore database backup if needed:

   ```bash
   # Database restore command here
   ```

3. Deploy previous version:
   ```bash
   git checkout <previous-tag>
   docker compose -f docker-compose.prod.yml up -d
   ```

### Emergency Contacts

- Technical Lead: [Contact Info]
- DevOps Lead: [Contact Info]
- Database Admin: [Contact Info]

## Maintenance

### Regular Tasks

- [ ] Monitor system resources
- [ ] Check application logs
- [ ] Review security updates
- [ ] Backup database regularly
- [ ] Update SSL certificates before expiry

### Documentation

- [ ] Update API documentation
- [ ] Document any deployment issues
- [ ] Update runbook if needed
- [ ] Record any configuration changes
