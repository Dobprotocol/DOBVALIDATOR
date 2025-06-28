# Production Deployment Guide

## Overview

This guide covers the changes made to migrate from a local Prisma backend to a production-ready Supabase setup for the DOB Validator application.

## Changes Made

### 1. API Endpoints Updated

All API endpoints have been updated to use Supabase directly instead of forwarding to a local backend server:

#### Updated Endpoints:

- `/api/drafts` - Draft management (create, read, update, delete)
- `/api/drafts/[id]` - Individual draft operations
- `/api/submissions` - Submission management
- `/api/submit` - Form submission
- `/api/profile` - User profile management
- `/api/certificates/generate` - Certificate generation
- `/api/certificates/[id]/verify` - Certificate verification

### 2. Supabase Service Layer

Created a comprehensive service layer (`frontend/lib/supabase-service.ts`) with methods for:

- User management
- Profile management
- Draft management
- Submission management
- Certificate management

### 3. Database Schema Updates

Updated the Supabase database types (`frontend/lib/supabase.ts`) to include:

- `users` table
- `profiles` table
- `submissions` table
- `drafts` table
- `certificates` table

### 4. Frontend Hooks Updated

Updated `frontend/hooks/use-draft.ts` to use Next.js API routes instead of direct backend calls.

## Environment Variables Required

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stellar Configuration
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

## Supabase Database Setup

### Required Tables

1. **users**

   ```sql
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     wallet_address TEXT UNIQUE NOT NULL,
     email TEXT,
     name TEXT,
     company TEXT,
     role TEXT CHECK (role IN ('OPERATOR', 'ADMIN')) DEFAULT 'OPERATOR',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **profiles**

   ```sql
   CREATE TABLE profiles (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     company TEXT,
     email TEXT NOT NULL,
     wallet_address TEXT UNIQUE NOT NULL,
     phone TEXT,
     website TEXT,
     bio TEXT,
     profile_image TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **submissions**

   ```sql
   CREATE TABLE submissions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     device_name TEXT NOT NULL,
     device_type TEXT NOT NULL,
     custom_device_type TEXT,
     location TEXT NOT NULL,
     serial_number TEXT NOT NULL,
     manufacturer TEXT NOT NULL,
     model TEXT NOT NULL,
     year_of_manufacture TEXT NOT NULL,
     condition TEXT NOT NULL,
     specifications TEXT NOT NULL,
     purchase_price TEXT NOT NULL,
     current_value TEXT NOT NULL,
     expected_revenue TEXT NOT NULL,
     operational_costs TEXT NOT NULL,
     status TEXT CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
     submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **drafts**

   ```sql
   CREATE TABLE drafts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     device_name TEXT DEFAULT '',
     device_type TEXT DEFAULT '',
     location TEXT DEFAULT '',
     serial_number TEXT DEFAULT '',
     manufacturer TEXT DEFAULT '',
     model TEXT DEFAULT '',
     year_of_manufacture TEXT DEFAULT '',
     condition TEXT DEFAULT '',
     specifications TEXT DEFAULT '',
     purchase_price TEXT DEFAULT '',
     current_value TEXT DEFAULT '',
     expected_revenue TEXT DEFAULT '',
     operational_costs TEXT DEFAULT '',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **certificates**
   ```sql
   CREATE TABLE certificates (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     certificate_hash TEXT UNIQUE NOT NULL,
     stellar_tx_hash TEXT,
     issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     expires_at TIMESTAMP WITH TIME ZONE,
     status TEXT CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED')) DEFAULT 'ACTIVE',
     submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     metadata JSONB
   );
   ```

### Row Level Security (RLS)

Enable RLS on all tables and create appropriate policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = wallet_address);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid()::text = wallet_address);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = wallet_address);

-- Similar policies for other tables...
```

## Deployment Steps

### 1. Supabase Setup

1. Create a new Supabase project
2. Set up the database tables as shown above
3. Configure RLS policies
4. Get your project URL and anon key

### 2. Environment Configuration

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials
3. Set appropriate Stellar network configuration

### 3. Deploy to Vercel

1. Connect your repository to Vercel
2. Set the environment variables in Vercel dashboard
3. Deploy the application

### 4. Verify Deployment

1. Test authentication flow
2. Test draft creation and management
3. Test submission process
4. Test certificate generation and verification

## Key Benefits of This Setup

1. **No Backend Server Required**: All database operations happen directly through Supabase
2. **Scalable**: Supabase handles scaling automatically
3. **Secure**: Row Level Security ensures data isolation
4. **Real-time**: Supabase provides real-time capabilities if needed
5. **Cost-effective**: No need to maintain a separate backend server

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Supabase CORS settings include your domain
2. **Authentication Issues**: Check that RLS policies are correctly configured
3. **Database Connection**: Verify Supabase URL and anon key are correct

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test Supabase connection directly
4. Check RLS policies are working correctly

## Migration from Local Development

If migrating from local development:

1. Export any existing data from local database
2. Import data into Supabase (if needed)
3. Update environment variables
4. Test all functionality
5. Deploy to production

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **RLS Policies**: Ensure proper data isolation between users
3. **API Keys**: Use anon key for client-side operations, service role key only for admin operations
4. **Input Validation**: All inputs are validated on both client and server side
