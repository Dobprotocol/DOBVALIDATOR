#!/usr/bin/env node

const fetch = require('node-fetch');

// Replace this with your actual JWT token from production
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function debugJWTIssue() {
  console.log('🔍 Debugging JWT Authentication Issue...');
  console.log('');
  
  if (JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('❌ Please replace JWT_TOKEN with your actual token from production');
    console.log('');
    console.log('📋 How to get your JWT token from production:');
    console.log('1. Go to https://validator.dobprotocol.com');
    console.log('2. Connect your Stellar wallet');
    console.log('3. Sign the challenge');
    console.log('4. Open DevTools → Application → Local Storage');
    console.log('5. Find "authToken" and copy the "token" value');
    console.log('6. Replace JWT_TOKEN in this script');
    console.log('');
    console.log('🔑 ***REMOVED*** for Vercel: 4a26e4917d443a410275a40b5d007aec582a8ddbdf3d1b265f21d688fbd83c45');
    return;
  }
  
  console.log('🔑 Testing with JWT token:', JWT_TOKEN.substring(0, 20) + '...');
  console.log('');
  
  // Test 1: Check if JWT token is valid format
  console.log('🧪 Test 1: JWT Token Format');
  const tokenParts = JWT_TOKEN.split('.');
  if (tokenParts.length !== 3) {
    console.log('❌ Invalid JWT format (should have 3 parts separated by dots)');
    return;
  }
  console.log('✅ JWT format is valid');
  console.log('');
  
  // Test 2: Check JWT payload (without verification)
  try {
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('🧪 Test 2: JWT Payload');
    console.log('📄 Payload:', JSON.stringify(payload, null, 2));
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('❌ JWT token is expired!');
      console.log('⏰ Token expires at:', new Date(payload.exp * 1000));
      console.log('⏰ Current time:', new Date(now * 1000));
      return;
    }
    console.log('✅ JWT token is not expired');
    console.log('');
  } catch (error) {
    console.log('❌ Error parsing JWT payload:', error.message);
    return;
  }
  
  // Test 3: Test profile endpoint
  console.log('🧪 Test 3: Profile Endpoint');
  try {
    console.log('🔍 Testing: https://validator.dobprotocol.com/api/profile');
    
    const response = await fetch('https://validator.dobprotocol.com/api/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('');
    
    const data = await response.json();
    console.log('📄 Response Body:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    
    if (response.ok) {
      console.log('✅ SUCCESS: ***REMOVED*** is properly configured!');
      console.log('✅ Authentication flow is working correctly');
    } else {
      console.log('❌ ERROR: Profile endpoint failed');
      if (data.error === 'Authorization header required') {
        console.log('❌ ***REMOVED*** is NOT set in Vercel');
        console.log('🔧 Action: Set ***REMOVED*** environment variable');
      } else if (data.error === 'Invalid token') {
        console.log('❌ ***REMOVED*** is NOT set in Vercel');
        console.log('🔧 Action: Set ***REMOVED*** environment variable');
      } else if (data.error === 'Token expired') {
        console.log('❌ JWT token is expired');
        console.log('🔧 Action: Get a fresh token by re-authenticating');
      } else {
        console.log('❌ Unknown error:', data.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
  
  console.log('');
  console.log('🔧 TROUBLESHOOTING STEPS:');
  console.log('1. Verify ***REMOVED*** is set in Vercel Dashboard');
  console.log('2. Redeploy the project after setting environment variable');
  console.log('3. Get a fresh JWT token by re-authenticating');
  console.log('4. Check if the token is not expired');
}

debugJWTIssue(); 