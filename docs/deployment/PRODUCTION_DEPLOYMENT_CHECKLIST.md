# Production Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Create `.env.production` from template for each service
- [ ] Generate and set strong JWT secret
- [ ] Configure proper database credentials
- [ ] Set up proper CORS origins
- [ ] Configure Stellar network settings (testnet/mainnet)
- [ ] Set up proper logging levels
- [ ] Configure rate limiting

### Database
- [ ] Backup existing database (if applicable)
- [ ] Run database migrations
- [ ] Verify database connection string
- [ ] Check database user permissions
- [ ] Set up database backups

### Security
- [ ] Generate SSL certificates
- [ ] Configure nginx SSL settings
- [ ] Set up proper firewall rules
- [ ] Review security headers
- [ ] Check file permissions
- [ ] Verify JWT configuration
- [ ] Set up rate limiting
- [ ] Configure CORS properly

### Docker Configuration
- [ ] Update image versions
- [ ] Check volume mounts
- [ ] Verify network configuration
- [ ] Set up logging drivers
- [ ] Configure container restart policies
- [ ] Set up health checks
- [ ] Review resource limits

## Deployment Steps

1. **Database Setup**
   - [ ] Apply migrations
   - [ ] Verify data integrity
   - [ ] Check indexes

2. **Backend Service**
   - [ ] Build production image
   - [ ] Run health checks
   - [ ] Verify API endpoints
   - [ ] Check logging
   - [ ] Monitor resource usage

3. **Frontend Services**
   - [ ] Build production assets
   - [ ] Check static file serving
   - [ ] Verify API connectivity
   - [ ] Test user flows

4. **Nginx Configuration**
   - [ ] Configure SSL
   - [ ] Set up proper routing
   - [ ] Configure caching
   - [ ] Set up logging

## Post-Deployment

### Monitoring
- [ ] Set up health check monitoring
- [ ] Configure error alerting
- [ ] Set up performance monitoring
- [ ] Check log aggregation

### Testing
- [ ] Run smoke tests
- [ ] Verify critical paths
- [ ] Check error handling
- [ ] Test backup procedures
- [ ] Verify SSL configuration

### Documentation
- [ ] Update API documentation
- [ ] Document deployment process
- [ ] Update runbooks
- [ ] Document rollback procedures

### Performance
- [ ] Run load tests
- [ ] Check response times
- [ ] Monitor resource usage
- [ ] Verify caching

## Rollback Plan

1. **Database**
   - [ ] Backup current state
   - [ ] Prepare rollback scripts
   - [ ] Test restore procedures

2. **Services**
   - [ ] Keep previous images tagged
   - [ ] Document version numbers
   - [ ] Test rollback procedure

3. **Configuration**
   - [ ] Backup all config files
   - [ ] Document changes
   - [ ] Keep previous versions

## Emergency Contacts

- **DevOps Lead**: [Name] - [Contact]
- **Backend Lead**: [Name] - [Contact]
- **Frontend Lead**: [Name] - [Contact]
- **Database Admin**: [Name] - [Contact]

## Monitoring URLs

- Backend Health: `https://api.example.com/health`
- Frontend Status: `https://app.example.com/status`
- Database Status: [Dashboard URL]
- Logs: [Log Aggregator URL]
