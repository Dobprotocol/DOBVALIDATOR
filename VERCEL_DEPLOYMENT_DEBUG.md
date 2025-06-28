# Vercel Deployment Debug Guide

## Current Issues to Monitor

### 1. Profile Creation (Fixed)

- ✅ Added `user_id` to profile creation
- ✅ Fetch user by wallet address before creating profile
- 🔍 Test if 500 error is resolved

### 2. Authentication Flow

- 🔍 Check JWT token format
- 🔍 Verify wallet_address claim in JWT
- 🔍 Test RLS policies

### 3. Database Connection

- 🔍 Verify Supabase URL and API key
- 🔍 Check CORS settings in Supabase
- 🔍 Test direct Supabase connection

### 4. Environment Variables

- 🔍 Verify all env vars are set in Vercel
- 🔍 Check for typos in variable names
- 🔍 Ensure proper formatting

## Debugging Steps

### Step 1: Check Vercel Environment Variables

```bash
# In Vercel Dashboard > Project Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

### Step 2: Test Supabase Connection

```javascript
// Add this to a test page to verify connection
import { supabase } from "@/lib/supabase";

// Test connection
const { data, error } = await supabase.from("users").select("count");
console.log("Supabase connection test:", { data, error });
```

### Step 3: Check JWT Claims

```javascript
// In browser console, check JWT token
const token = localStorage.getItem("authToken");
if (token) {
  const parsed = JSON.parse(token);
  console.log("JWT token:", parsed);
  // Check if wallet_address is present
}
```

### Step 4: Test RLS Policies

```sql
-- In Supabase SQL Editor
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'profiles', 'submissions', 'drafts', 'certificates');

-- Check policies
SELECT tablename, policyname, cmd FROM pg_policies
WHERE schemaname = 'public';
```

### Step 5: Monitor Network Requests

- Open browser DevTools > Network tab
- Monitor API calls to `/api/*` endpoints
- Check request/response headers and bodies
- Look for CORS errors

### Step 6: Check Vercel Function Logs

- Go to Vercel Dashboard > Functions
- Check for any function errors
- Monitor cold start times

## Common Issues & Solutions

### Issue 1: CORS Errors

**Solution:** Update Supabase CORS settings

```sql
-- In Supabase Dashboard > Settings > API
-- Add your Vercel domain to allowed origins
```

### Issue 2: RLS Policy Violations

**Solution:** Check JWT claims match policy conditions

```sql
-- Verify policy uses correct claim
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');
```

### Issue 3: Missing Environment Variables

**Solution:** Double-check Vercel environment variables

- Ensure no extra spaces
- Verify variable names match code
- Check if variables are set for correct environment (Production/Preview)

### Issue 4: Database Schema Mismatch

**Solution:** Run the complete setup script

```sql
-- Run supabase-rls-setup.sql in Supabase SQL Editor
```

## Testing Checklist

- [ ] Profile creation works (no 500 error)
- [ ] Authentication flow completes
- [ ] Draft creation works
- [ ] Submission creation works
- [ ] Certificate generation works
- [ ] Admin functions work (if applicable)

## Monitoring Commands

### Check Vercel Deployment Status

```bash
# Check deployment logs
vercel logs --follow
```

### Test Local vs Production

```bash
# Compare local and production behavior
# Test with same wallet address on both environments
```

## Next Steps

1. **Monitor the new deployment** for profile creation fix
2. **Test all major user flows** in production
3. **Check for any remaining 500 errors**
4. **Verify RLS policies** are working correctly
5. **Test admin functionality** if applicable

## Emergency Rollback

If issues persist:

```bash
# Revert to previous working version
git revert HEAD
git push
```
