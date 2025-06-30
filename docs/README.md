# DOB Validator Documentation

## Overview

The DOB Validator is a decentralized application for validating and certifying devices on the Stellar blockchain. This documentation provides comprehensive information about the system's architecture, deployment procedures, and maintenance guidelines.

## Table of Contents

### Deployment

- [Production Deployment Checklist](./deployment/PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- [Environment Configuration Guide](./deployment/ENVIRONMENT_CONFIGURATION.md)
- [Docker Setup Guide](./deployment/DOCKER_SETUP.md)
- [SSL/TLS Configuration](./deployment/SSL_CONFIGURATION.md)

### Development

- [Local Development Setup](./development/LOCAL_SETUP.md)
- [Code Structure](./development/CODE_STRUCTURE.md)
- [Testing Guidelines](./development/TESTING.md)
- [Contributing Guidelines](./development/CONTRIBUTING.md)

### Database

- [Database Schema](./database/SCHEMA.md)
- [Migration Guide](./database/MIGRATIONS.md)
- [Backup and Restore](./database/BACKUP_RESTORE.md)

### DevOps

- [Monitoring Setup](./devops/MONITORING.md)
- [Logging Configuration](./devops/LOGGING.md)
- [Security Guidelines](./devops/SECURITY.md)
- [Maintenance Procedures](./devops/MAINTENANCE.md)

## Quick Start

### Production Deployment

1. Clone the repository
2. Run the environment setup script:
   ```bash
   ./scripts/setup-env.sh
   ```
3. Update environment variables in `.env` files
4. Build and start services:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

### Development Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Set up environment:
   ```bash
   cp .env.example .env
   ```
3. Start development servers:
   ```bash
   pnpm dev
   ```

## Architecture

The system consists of three main components:

1. **Frontend** (Next.js)

   - User interface for device validation
   - Stellar wallet integration
   - Form submission and management

2. **Backoffice** (Next.js)

   - Administrative dashboard
   - Submission review system
   - User management

3. **Backend** (Node.js)
   - RESTful API
   - Database management
   - Stellar contract integration

## Support

For technical support or questions:

- Create an issue in the repository
- Contact the development team
- Check the troubleshooting guides in the documentation
