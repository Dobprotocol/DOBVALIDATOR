#!/usr/bin/env node

const fetch = require('node-fetch');

// Replace this with your actual JWT token from localStorage
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function testProfileEndpoint() {
  console.log('🧪 Testing profile endpoint with JWT...');
  console.log('');
  
  if (JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('❌ Please replace JWT_TOKEN with your actual token from localStorage');
    console.log('');
    console.log('📋 How to get your JWT token:');
    console.log('1. Go to http://localhost:3002');
    console.log('2. Connect your Stellar wallet');
    console.log('3. Sign the challenge');
    console.log('4. Open DevTools → Application → Local Storage');
    console.log('5. Find "authToken" and copy the "token" value');
    console.log('6. Replace JWT_TOKEN in this script');
    console.log('');
    console.log('🔑 Your ***REMOVED*** is: 4a26e4917d443a410275a40b5d007aec582a8ddbdf3d1b265f21d688fbd83c45');
    console.log('📝 DevOps needs to set this as ***REMOVED*** environment variable in backend');
    return;
  }
  
  try {
    console.log('🔍 Testing: https://v.dobprotocol.com/api/profile');
    console.log('🔑 Using JWT token:', JWT_TOKEN.substring(0, 20) + '...');
    console.log('');
    
    const response = await fetch('https://v.dobprotocol.com/api/profile', {
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
      console.log('✅ SUCCESS: Profile endpoint is working!');
      console.log('✅ ***REMOVED*** is properly configured in backend');
    } else {
      console.log('❌ ERROR: Profile endpoint failed');
      if (data.error === 'Authorization header required') {
        console.log('❌ ***REMOVED*** is NOT set in backend');
        console.log('🔧 DevOps needs to set ***REMOVED*** environment variable');
      }
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testProfileEndpoint(); 