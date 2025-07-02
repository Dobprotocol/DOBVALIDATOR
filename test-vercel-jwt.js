#!/usr/bin/env node

const fetch = require('node-fetch');

// Replace this with your actual JWT token from production
const JWT_TOKEN = '4a26e4917d443a410275a40b5d007aec582a8ddbdf3d1b265f21d688fbd83c45';

async function testVercelJWT() {
  console.log('🧪 Testing Vercel JWT_SECRET configuration...');
  console.log('');
  
  if (JWT_TOKEN === '4a26e4917d443a410275a40b5d007aec582a8ddbdf3d1b265f21d688fbd83c45') {
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
    console.log('🔑 JWT_SECRET for Vercel: 4a26e4917d443a410275a40b5d007aec582a8ddbdf3d1b265f21d688fbd83c45');
    return;
  }
  
  try {
    console.log('🔍 Testing: https://validator.dobprotocol.com/api/profile');
    console.log('🔑 Using JWT token:', JWT_TOKEN.substring(0, 20) + '...');
    console.log('');
    
    const response = await fetch('https://validator.dobprotocol.com/api/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('');
    
    const data = await response.json();
    console.log('📄 Response Body:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    
    if (response.ok) {
      console.log('✅ SUCCESS: JWT_SECRET is properly configured in Vercel!');
      console.log('✅ Authentication flow is working correctly');
    } else {
      console.log('❌ ERROR: JWT_SECRET is NOT configured in Vercel');
      console.log('');
      console.log('🔧 NEXT STEPS:');
      console.log('1. Go to Vercel Dashboard → Project Settings → Environment Variables');
      console.log('2. Add JWT_SECRET = 4a26e4917d443a410275a40b5d007aec582a8ddbdf3d1b265f21d688fbd83c45');
      console.log('3. Redeploy the project');
      console.log('4. Test again');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testVercelJWT(); 