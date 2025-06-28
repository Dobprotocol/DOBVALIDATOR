# 🚀 DOB Validator - Supabase Deployment Guide

This guide will help you deploy the DOB Validator application with Supabase integration for full end-to-end testing.

## 📋 Prerequisites

- Supabase account and project
- Vercel account
- Git repository with your code

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create Database Tables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vvkbwiwaernhclsojirf
2. Navigate to **SQL Editor**
3. Copy and paste the entire content from `supabase-schema.sql`
4. Click **Run** to execute the script

### 1.2 Verify Tables Created

After running the script, you should see these tables in your **Table Editor**:

- `users`
- `profiles`
- `submissions`
- `drafts`
- `submission_files`
- `draft_files`
- `admin_reviews`
- `certificates`
- `auth_challenges`
- `auth_sessions`

## 🌐 Step 2: Deploy to Vercel

### 2.1 Frontend Deployment

1. **Connect Repository to Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **New Project**
   - Import your Git repository
   - Set the **Root Directory** to `frontend`

2. **Configure Environment Variables**

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://vvkbwiwaernhclsojirf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a2J3aXdhZXJuaGNsc29qaXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzQ2MDYsImV4cCI6MjA2NjU1MDYwNn0.4_ikMFDXibAd25hF7ika5qyk2PHkRy_E6Dl4r0A3TGg
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
   NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES=GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN
   NEXT_PUBLIC_MAX_FILE_SIZE=10485760
   NEXT_PUBLIC_UPLOAD_DIR=uploads
   NODE_ENV=production
   ```

3. **Build Settings**

   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

4. **Deploy**
   - Click **Deploy**
   - Wait for build to complete
   - Note the deployment URL

### 2.2 Backoffice Deployment

1. **Create New Vercel Project**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **New Project**
   - Import the same Git repository
   - Set the **Root Directory** to `backoffice`

2. **Configure Environment Variables**

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://vvkbwiwaernhclsojirf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a2J3aXdhZXJuaGNsc29qaXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzQ2MDYsImV4cCI6MjA2NjU1MDYwNn0.4_ikMFDXibAd25hF7ika5qyk2PHkRy_E6Dl4r0A3TGg
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
   NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES=GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN
   NODE_ENV=production
   ```

3. **Build Settings**

   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

4. **Deploy**
   - Click **Deploy**
   - Wait for build to complete
   - Note the deployment URL

## 🧪 Step 3: Testing the Deployment

### 3.1 Test Frontend

1. **Visit your frontend URL**
2. **Connect Stellar Wallet**

   - Use a testnet wallet (e.g., Freighter with testnet)
   - Ensure you have testnet XLM

3. **Test Device Submission Flow**

   - Fill out the device form
   - Upload documentation
   - Submit the form
   - Verify submission appears in database

4. **Test Draft Saving**
   - Start filling a form
   - Save as draft
   - Verify draft appears in database

### 3.2 Test Backoffice

1. **Visit your backoffice URL**
2. **Connect Admin Wallet**

   - Use the admin wallet: `GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN`

3. **Test Admin Functions**
   - View pending submissions
   - Review submission details
   - Approve/reject submissions
   - Verify status updates in database

### 3.3 Database Verification

1. **Check Supabase Dashboard**

   - Go to **Table Editor**
   - Verify data is being created
   - Check relationships between tables

2. **Test Real-time Features**
   - Open multiple browser tabs
   - Make changes in one tab
   - Verify updates appear in other tabs

## 🔧 Step 4: Troubleshooting

### Common Issues

1. **Build Failures**

   - Check environment variables are set correctly
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**

   - Verify Supabase URL and key are correct
   - Check if tables exist in Supabase
   - Verify RLS policies are configured

3. **Authentication Issues**

   - Check wallet connection
   - Verify admin wallet address
   - Check browser console for errors

4. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Check network connectivity

### Debug Commands

```bash
# Test Supabase connection locally
cd frontend
node test-supabase-simple.js

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Test database schema
# Run this in Supabase SQL Editor
SELECT * FROM users LIMIT 1;
```

## 📊 Step 5: Monitoring

### Vercel Analytics

- Enable Vercel Analytics for performance monitoring
- Set up error tracking
- Monitor build times and deployment success rates

### Supabase Monitoring

- Check database performance in Supabase Dashboard
- Monitor API usage and limits
- Set up alerts for errors

### Application Monitoring

- Add error logging (e.g., Sentry)
- Monitor user interactions
- Track submission success rates

## 🔒 Step 6: Security Considerations

### Environment Variables

- Never commit sensitive keys to Git
- Use Vercel's environment variable encryption
- Rotate keys regularly

### Database Security

- Review RLS policies
- Limit API access
- Monitor for suspicious activity

### Wallet Security

- Use testnet wallets for development
- Implement proper wallet validation
- Add rate limiting for submissions

## 🚀 Step 7: Production Checklist

- [ ] All environment variables configured
- [ ] Database tables created and populated
- [ ] Frontend deployed and accessible
- [ ] Backoffice deployed and accessible
- [ ] Wallet connection working
- [ ] Form submission working
- [ ] Draft saving working
- [ ] Admin review process working
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Security measures in place
- [ ] Monitoring configured

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check Supabase dashboard for errors
4. Verify environment variables
5. Test locally first

## 🎉 Success!

Once all steps are completed, you'll have a fully functional DOB Validator application running on Vercel with Supabase as the backend database. Users can submit device validations, save drafts, and admins can review and approve submissions through the backoffice interface.
