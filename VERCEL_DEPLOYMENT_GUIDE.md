# Vercel Deployment Guide for DOB Validator

This guide will help you deploy the DOB Validator to Vercel with Supabase integration for full E2E testing.

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
3. **GitHub Repository** - Your forked repository at `https://github.com/blessedux/DOBVALIDATOR.git`

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and API keys

### 1.2 Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the database schema from `supabase-schema.sql` (if available) or use the Prisma schema

### 1.3 Get Database Connection String

1. Go to Settings > Database
2. Copy the connection string (it looks like: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`)

## Step 2: Deploy Backend to Vercel

### 2.1 Create Backend Vercel Project

1. Go to Vercel dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Set the following configuration:
   - **Framework Preset**: Node.js
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.2 Configure Backend Environment Variables

In your Vercel project settings, add these environment variables:

```env
# Database Configuration (Supabase)
***REMOVED***=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT Configuration
***REMOVED***=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Stellar Configuration
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# File Storage Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration (update with your frontend URL)
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 2.3 Deploy Backend

1. Push your changes to the `fix/vercel` branch
2. Vercel will automatically deploy
3. Note the backend URL (e.g., `https://your-backend.vercel.app`)

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Frontend Vercel Project

1. Go to Vercel dashboard
2. Click "New Project"
3. Import your GitHub repository again
4. Set the following configuration:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3.2 Configure Frontend Environment Variables

In your Vercel project settings, add these environment variables:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-backend.vercel.app

# Stellar Configuration
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Admin Configuration
NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES=GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_UPLOAD_DIR=uploads

# Development Configuration
NODE_ENV=production
```

### 3.3 Deploy Frontend

1. Push your changes to the `fix/vercel` branch
2. Vercel will automatically deploy
3. Note the frontend URL (e.g., `https://your-frontend.vercel.app`)

## Step 4: Deploy Backoffice to Vercel

### 4.1 Create Backoffice Vercel Project

1. Go to Vercel dashboard
2. Click "New Project"
3. Import your GitHub repository again
4. Set the following configuration:
   - **Framework Preset**: Next.js
   - **Root Directory**: `backoffice`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 4.2 Configure Backoffice Environment Variables

In your Vercel project settings, add these environment variables:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-backend.vercel.app

# Stellar Configuration
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Admin Configuration
NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES=GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN

# Development Configuration
NODE_ENV=production
```

### 4.3 Deploy Backoffice

1. Push your changes to the `fix/vercel` branch
2. Vercel will automatically deploy
3. Note the backoffice URL (e.g., `https://your-backoffice.vercel.app`)

## Step 5: Update CORS Configuration

### 5.1 Update Backend CORS

1. Go to your backend Vercel project settings
2. Update the `CORS_ORIGIN` environment variable to include both frontend and backoffice URLs:

```env
CORS_ORIGIN=https://your-frontend.vercel.app,https://your-backoffice.vercel.app
```

### 5.2 Redeploy Backend

1. Trigger a new deployment in Vercel
2. Or push a small change to trigger automatic deployment

## Step 6: Test E2E Flow

### 6.1 Test Frontend Submission

1. Go to your frontend URL
2. Connect your Stellar wallet
3. Fill out the device submission form
4. Test the auto-save draft functionality
5. Submit the final form
6. Verify data appears in Supabase database

### 6.2 Test Backoffice Review

1. Go to your backoffice URL
2. Connect with an admin wallet
3. View submitted devices
4. Test review and approval process
5. Verify changes are reflected in Supabase

### 6.3 Test Data Persistence

1. Refresh both frontend and backoffice
2. Verify data persists across sessions
3. Test draft loading and editing
4. Verify final submissions are permanent

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `CORS_ORIGIN` includes all your Vercel domains
2. **Database Connection**: Verify `***REMOVED***` is correct and Supabase is accessible
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **Build Errors**: Check Vercel build logs for any missing dependencies

### Debug Steps

1. Check Vercel function logs for backend errors
2. Check browser console for frontend errors
3. Verify Supabase database connections
4. Test API endpoints directly using tools like Postman

## Environment Variables Summary

### Backend (.env)

```env
***REMOVED***=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
***REMOVED***=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app,https://your-backoffice.vercel.app
```

### Frontend (.env)

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.vercel.app
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES=GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_UPLOAD_DIR=uploads
NODE_ENV=production
```

### Backoffice (.env)

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.vercel.app
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES=GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN
NODE_ENV=production
```

## Success Criteria

✅ Frontend can submit device data to backend  
✅ Backend stores data in Supabase database  
✅ Backoffice can fetch and review submissions  
✅ Draft functionality works with auto-save  
✅ Data persists across deployments  
✅ Full E2E flow works end-to-end

Your DOB Validator is now ready for production use with Vercel and Supabase!
