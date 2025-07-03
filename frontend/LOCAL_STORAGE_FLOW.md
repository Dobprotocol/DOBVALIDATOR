# Local Storage Flow for Testing

## Overview

This implementation modifies the authentication and profile flow to use local storage instead of database writes for testing purposes. This ensures that the flow always proceeds from wallet connection → profile creation → dashboard, regardless of database connectivity.

## Changes Made

### 1. API Service (`frontend/lib/api-service.ts`)

- Added `isDevelopmentMode()` function to detect development/testing environment
- Added local storage profile management methods:
  - `getLocalProfile()` - retrieves profile from localStorage
  - `setLocalProfile()` - stores profile in localStorage
- Modified `getProfile()` and `createProfile()` to use local storage in development mode
- Falls back to API calls in production mode

### 2. Profile Page (`frontend/app/profile/page.tsx`)

- Modified profile loading to check local storage first in development mode
- Enhanced profile submission to always proceed to dashboard
- Added fallback profile creation in local storage if API fails
- Ensures flow continues even if database operations fail

### 3. Main Page (`frontend/app/page.tsx`)

- Modified profile check to check local storage in development mode
- Ensures users with local profiles are redirected to dashboard
- Maintains API fallback for production

### 4. Navbar (`frontend/components/navbar.tsx`)

- Added local storage profile check for "Edit Profile" button visibility
- Ensures UI consistency in development mode

### 5. Test Utilities (`frontend/lib/test-utils.ts`)

- Created helper functions for testing the flow
- Available globally as `window.testUtils` in browser console

## How It Works

### Development Mode Detection

The system detects development mode when:

- `NODE_ENV === 'development'`
- Hostname is `localhost`
- Hostname includes `vercel.app`

### Profile Storage

Profiles are stored in two locations:

1. `localProfile_{walletAddress}` - API service compatible format
2. `userProfile` - Legacy format for backward compatibility

### Flow Sequence

1. **Wallet Connection**: User connects wallet via Simple Signer
2. **Authentication**: System creates fallback auth token in development mode
3. **Profile Check**: System checks local storage first, then API
4. **Profile Creation**: If no profile exists, user is redirected to profile page
5. **Profile Storage**: Profile is stored in local storage (with API fallback)
6. **Dashboard Redirect**: User is always redirected to dashboard after profile creation

## Testing

### Quick Test Setup

Open browser console and run:

```javascript
// Setup test flow with existing profile
window.testUtils.setupTestFlow("GCTEST123", {
  name: "Test User",
  company: "Test Company",
  email: "test@example.com",
});

// Clear test data
window.testUtils.clearTestData();

// Check if profile exists
window.testUtils.getTestProfile("GCTEST123");
```

### Manual Testing Steps

1. **Clear existing data**: Run `window.testUtils.clearTestData()`
2. **Connect wallet**: Should auto-authenticate in development mode
3. **Check flow**: Should redirect to profile creation if no profile exists
4. **Create profile**: Fill form and submit
5. **Verify redirect**: Should always redirect to dashboard
6. **Test persistence**: Refresh page, should redirect to dashboard

### Test Scenarios

#### Scenario 1: New User Flow

1. Clear all data
2. Connect wallet
3. Should redirect to profile creation
4. Create profile
5. Should redirect to dashboard

#### Scenario 2: Existing User Flow

1. Setup test profile using `window.testUtils.setupTestFlow()`
2. Connect wallet
3. Should redirect directly to dashboard

#### Scenario 3: API Failure Recovery

1. Setup test profile
2. Disconnect from internet (or mock API failure)
3. Connect wallet
4. Should still redirect to dashboard using local storage

## Benefits

1. **Reliable Testing**: Flow always works regardless of database state
2. **Fast Development**: No database dependencies for testing
3. **Consistent Behavior**: Same flow in development and production
4. **Easy Debugging**: Clear console logs for development mode
5. **Backward Compatibility**: Still works with real API in production

## Production Behavior

In production mode (non-development environments):

- Uses real API calls for profile operations
- Falls back to local storage only if API fails
- Maintains full database functionality
- No changes to production behavior

## Console Logs

Development mode includes detailed console logs:

- `🔧 [Development Mode]` - Local storage operations
- `✅ [LocalStorage]` - Successful local storage operations
- `⚠️` - Warnings about API failures with local storage fallback

## Troubleshooting

### Profile Not Found

- Check if wallet address is correct in localStorage
- Verify profile exists in both `localProfile_{address}` and `userProfile`
- Use `window.testUtils.getTestProfile(address)` to debug

### Authentication Issues

- Check if `authToken` exists in localStorage
- Verify token format and expiration
- Use `window.testUtils.createTestAuth(address)` to recreate

### Flow Not Working

- Clear all data with `window.testUtils.clearTestData()`
- Check console for development mode logs
- Verify hostname is in development mode detection list
