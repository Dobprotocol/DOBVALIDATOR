# Frontend Deployment Version

## Current Version: 2.0.3

### Changes in this deployment:

- ✅ Migrated from local Prisma backend to Supabase
- ✅ Updated all API endpoints to use Supabase directly
- ✅ Added comprehensive Supabase service layer
- ✅ Updated database schema with all required tables
- ✅ Fixed frontend hooks to use Next.js API routes
- ✅ Added production deployment guide
- ✅ Fixed backoffice CORS issues by removing hardcoded localhost URLs
- ✅ Fixed profile creation API to match actual database schema
- ✅ Added enhanced error handling and debugging for profile API
- ✅ Added debug endpoint to test Supabase connection

### Deployment Date: $(date)

### Environment Variables Required:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_STELLAR_NETWORK
- NEXT_PUBLIC_STELLAR_HORIZON_URL

### Status: Ready for Production
