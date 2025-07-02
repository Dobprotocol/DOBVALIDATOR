# E2E Authentication Test Plan

## 🎯 Test Objective

Verify that the complete authentication flow works end-to-end on the production deployment.

## 🔧 Prerequisites

- JWT_SECRET is set in Vercel: `4a26e4917d443a410275a40b5d007aec582a8ddbdf3d1b265f21d688fbd83c45`
- Latest code is deployed to production
- Real Stellar wallet available for testing

## 📋 Test Steps

### 1. Initial State Check

- [ ] Go to `https://validator.dobprotocol.com`
- [ ] Verify no authentication data exists in localStorage
- [ ] Check browser console for any errors

### 2. Wallet Connection

- [ ] Click "Connect Wallet" button
- [ ] Connect with a real Stellar wallet (not test mode)
- [ ] Verify wallet address is displayed
- [ ] Check console for connection logs

### 3. Authentication Flow

- [ ] Sign the authentication challenge
- [ ] Verify challenge is generated and stored
- [ ] Check console for authentication logs:
  - `🚀 Starting JWT-based authentication...`
  - `✅ Verification successful:`
  - `✅ JWT token stored in localStorage`

### 4. JWT Token Storage Verification

- [ ] Open DevTools → Application → Local Storage
- [ ] Look for `authToken` item
- [ ] Verify token structure:
  ```json
  {
    "token": "eyJ...", // Should start with eyJ (real JWT)
    "expiresIn": "7d",
    "walletAddress": "GCBA..."
  }
  ```

### 5. Profile API Test

- [ ] Check Network tab for `/api/profile` call
- [ ] Verify it returns 200 (not 401)
- [ ] Verify profile data is loaded correctly
- [ ] Check if user is redirected to dashboard

### 6. API Authentication Test

- [ ] Open browser console
- [ ] Run this test:

  ```javascript
  // Get JWT token from localStorage
  const authData = JSON.parse(localStorage.getItem("authToken"));
  console.log("JWT Token:", authData.token.substring(0, 20) + "...");

  // Test profile endpoint
  fetch("https://validator.dobprotocol.com/api/profile", {
    headers: { Authorization: `Bearer ${authData.token}` },
  })
    .then((r) => r.json())
    .then((data) => console.log("Profile Response:", data))
    .catch((e) => console.error("Error:", e));
  ```

## ✅ Expected Results

### Success Indicators:

- ✅ JWT token is stored in localStorage with correct format
- ✅ `/api/profile` returns 200 with user data
- ✅ No 401 Unauthorized errors
- ✅ User is redirected to dashboard after authentication
- ✅ Console shows successful authentication logs

### Failure Indicators:

- ❌ JWT token not found in localStorage
- ❌ Token format is incorrect (not starting with `eyJ`)
- ❌ `/api/profile` returns 401 Unauthorized
- ❌ User not redirected to dashboard
- ❌ Console shows authentication errors

## 🔍 Debug Commands

### Check JWT Token:

```javascript
const authData = JSON.parse(localStorage.getItem("authToken"));
console.log("Auth Data:", authData);
```

### Test Profile Endpoint:

```javascript
fetch("https://validator.dobprotocol.com/api/profile", {
  headers: { Authorization: `Bearer ${authData.token}` },
})
  .then((r) => console.log("Status:", r.status))
  .then((r) => r.json())
  .then((data) => console.log("Data:", data));
```

### Decode JWT Payload:

```javascript
const token = authData.token;
const payload = JSON.parse(atob(token.split(".")[1]));
console.log("JWT Payload:", payload);
```

## 🚨 Troubleshooting

### If JWT_SECRET is not set:

- Error: "Invalid token" or "Authorization header required"
- Solution: Set JWT_SECRET in Vercel environment variables

### If authentication fails:

- Check console for specific error messages
- Verify wallet signature is valid
- Check if challenge is properly stored

### If profile API fails:

- Verify JWT token is valid and not expired
- Check if JWT_SECRET matches between frontend and backend
- Verify the token is being sent in Authorization header

## 📊 Test Results Template

```
Test Date: ___________
Environment: Production (https://validator.dobprotocol.com)

✅ Wallet Connection: [PASS/FAIL]
✅ Challenge Generation: [PASS/FAIL]
✅ Authentication: [PASS/FAIL]
✅ JWT Storage: [PASS/FAIL]
✅ Profile API: [PASS/FAIL]
✅ Dashboard Redirect: [PASS/FAIL]

Notes: ___________
```
