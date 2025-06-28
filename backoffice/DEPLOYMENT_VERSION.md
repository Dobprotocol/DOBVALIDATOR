# Backoffice Deployment Version

## Current Version: 2.0.2

### Changes in this deployment:

- ✅ Updated to work with Supabase backend
- ✅ Maintained admin functionality for submission review
- ✅ Updated to handle new database schema
- ✅ Fixed CORS errors by removing hardcoded localhost URLs
- ✅ Updated API service to use relative routes
- ✅ Added authentication API routes (/api/auth/challenge, /api/auth/verify)
- ✅ Ready for production deployment

### Deployment Date: $(date)

### Environment Variables Required:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_STELLAR_NETWORK
- NEXT_PUBLIC_STELLAR_HORIZON_URL

### Admin Features:

- Submission review and approval
- User management
- Certificate generation
- Dashboard analytics
- Admin authentication with wallet

### Status: Ready for Production
