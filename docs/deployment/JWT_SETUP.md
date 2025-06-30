# JWT Setup Guide

## Overview

This guide explains how to securely generate and manage JWT secrets for different environments.

## Generating JWT Secret

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Run the JWT secret generation script:

   ```bash
   node scripts/generate-jwt-secret.js
   ```

3. The script will output a secure random JWT secret. Example output:

   ```
   Generated JWT Secret:
   ====================
   YOUR_GENERATED_SECRET_WILL_APPEAR_HERE

   Add this to your .env file as:
   JWT_SECRET="YOUR_GENERATED_SECRET_WILL_APPEAR_HERE"
   ```

## Environment Setup

1. For each environment (development, staging, production):

   - Generate a unique JWT secret using the script
   - Add the generated secret to the environment's `.env` file
   - Never reuse JWT secrets across environments

2. Store the JWT secrets securely:
   - Use a secure secrets management system (e.g., HashiCorp Vault, AWS Secrets Manager)
   - Never commit JWT secrets to version control
   - Limit access to production JWT secrets

## Security Best Practices

1. JWT Secret Rotation:

   - Rotate JWT secrets periodically (e.g., every 90 days)
   - Plan secret rotation during low-traffic periods
   - Ensure proper transition period for token validation

2. Access Control:

   - Restrict access to JWT secrets to authorized personnel only
   - Log all access attempts to JWT secrets
   - Use role-based access control for secret management

3. Monitoring:
   - Monitor JWT token usage and validation
   - Set up alerts for unusual token activity
   - Keep audit logs of token generation and validation

## Emergency Procedures

1. In case of JWT secret compromise:
   - Generate new JWT secret immediately
   - Invalidate all existing tokens
   - Update secret in environment
   - Notify affected users to re-authenticate

## Deployment Checklist

- [ ] Generate unique JWT secret for the environment
- [ ] Add JWT secret to environment configuration
- [ ] Verify JWT secret is properly loaded
- [ ] Test authentication with new secret
- [ ] Document secret rotation schedule
- [ ] Set up monitoring and alerts
