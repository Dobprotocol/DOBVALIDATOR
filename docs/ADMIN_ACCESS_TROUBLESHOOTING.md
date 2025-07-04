# Admin Access Troubleshooting Guide

## Problem

The backoffice is getting a 403 "Admin access required" error when trying to access submission details:

```
Failed to load resource: the server responded with a status of 403 (Forbidden)
❌ API Error 403: {"error":"Admin access required"}
```

## Root Cause

The issue is that the backoffice and backend have separate admin wallet systems:

1. **Backoffice**: Uses a hardcoded admin wallet whitelist in `backoffice/lib/admin-config.ts`
2. **Backend**: Checks for `user?.role === 'ADMIN'` in the database

The backoffice admin wallets are not automatically synced to the backend database with ADMIN role.

## Solution

### Step 1: Run the Database Migration

First, ensure the profile image field is added to the database:

```sql
-- Run this in DBeaver
ALTER TABLE "profiles" ADD COLUMN "profileImage" TEXT;
```

### Step 2: Add Admin Wallets to Backend Database

Run the admin wallet sync script in DBeaver:

**File**: `backend/scripts/add-admin-wallets.sql`

This script will:

- Add all 6 backoffice admin wallets to the backend database
- Set their role to `ADMIN`
- Use `ON CONFLICT` to update existing users if they already exist

### Step 3: Verify Admin Access

After running the script, verify that admin users exist:

```sql
-- Check admin users in database
SELECT
  "walletAddress",
  "name",
  "role",
  "createdAt",
  "updatedAt"
FROM "users"
WHERE "role" = 'ADMIN'
ORDER BY "name";
```

You should see all 6 admin wallets with `ADMIN` role.

## Admin Wallet List

The following wallets should have ADMIN access:

| Name         | Wallet Address                                             | Role        |
| ------------ | ---------------------------------------------------------- | ----------- |
| Forecast     | `GAAKZ5PTQ7YLHTWQJQWEPAFOHEYFADEPB4DCBE4JWT63JCYJTCGULCAC` | SUPER_ADMIN |
| Current User | `GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN` | SUPER_ADMIN |
| Whitelist 1  | `GDGYOBHJVNGVBCIHKDR7H6NNYRSPPK2TWANH6SIY34DJLSXUOJNXA2SN` | VALIDATOR   |
| Whitelist 2  | `GCLASRLEFVHLLYHIMTAC36E42OTZPKQDAL52AEKBVTIWNPVEC4GXMAFG` | VALIDATOR   |
| User 1       | `GC6GCTEW7Y4GA6DH7WM26NEKSW4RPI3ZVN6E3FLW3ZVNILKLV77I43BK` | VALIDATOR   |
| User 2       | `GCGZFA2PFQYHPGWCOL36J7DXQ3O3TFNIN24QAQ7J4BWQYH6OIGA7THOY` | VALIDATOR   |

## Testing Steps

### 1. Test Admin Authentication

1. Open the backoffice
2. Connect with one of the admin wallets
3. Verify authentication succeeds
4. Check that the user has admin permissions

### 2. Test Submission Access

1. Navigate to a submission in the backoffice
2. Verify you can view submission details without 403 errors
3. Test admin actions (approve, reject, review)

### 3. Test Profile Image Upload

1. Go to the profile page
2. Upload a profile image
3. Verify the image is saved and displayed correctly

## Debug Commands

### Check Current Admin Users

```sql
SELECT
  "walletAddress",
  "name",
  "role"
FROM "users"
WHERE "role" = 'ADMIN';
```

### Check Specific User Role

```sql
SELECT
  "walletAddress",
  "name",
  "role"
FROM "users"
WHERE "walletAddress" = 'YOUR_WALLET_ADDRESS';
```

### Update Single User to Admin

```sql
UPDATE "users"
SET "role" = 'ADMIN', "updatedAt" = NOW()
WHERE "walletAddress" = 'YOUR_WALLET_ADDRESS';
```

## Common Issues

### Issue 1: User exists but role is not ADMIN

**Solution**: Update the user's role to ADMIN

```sql
UPDATE "users"
SET "role" = 'ADMIN', "updatedAt" = NOW()
WHERE "walletAddress" = 'WALLET_ADDRESS';
```

### Issue 2: User doesn't exist in database

**Solution**: Insert the user with ADMIN role

```sql
INSERT INTO "users" ("id", "walletAddress", "email", "name", "company", "role", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'WALLET_ADDRESS',
  'user@dobvalidator.com',
  'User Name',
  'DOB Protocol',
  'ADMIN',
  NOW(),
  NOW()
);
```

### Issue 3: JWT token expired

**Solution**: Re-authenticate in the backoffice

## Prevention

To prevent this issue in the future:

1. **Automated Sync**: Consider creating a scheduled job to sync admin wallets
2. **Single Source of Truth**: Move admin configuration to environment variables or database
3. **Monitoring**: Add logging to track admin access attempts
4. **Testing**: Add automated tests for admin access flows

## Files Modified

- `backend/scripts/add-admin-wallets.sql` - SQL script to add admin wallets
- `backend/scripts/sync-admin-wallets.ts` - TypeScript script for future use
- `backend/scripts/add-profile-image-migration.sql` - Profile image migration
- `PROFILE_IMAGE_IMPLEMENTATION.md` - Profile image implementation guide
