#!/usr/bin/env node

const fetch = require('node-fetch');

// Replace this with your actual JWT token from localStorage
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function testEndpoint(url, name) {
  console.log(`🧪 Testing ${name}...`);
  console.log(`🔍 URL: ${url}`);
  console.log(`🔑 Using JWT token: ${JWT_TOKEN.substring(0, 20)}...`);
  console.log('');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 ${name} Status:`, response.status);
    
    const data = await response.json();
    console.log(`📄 ${name} Response:`, JSON.stringify(data, null, 2));
    console.log('');
    
    if (response.ok) {
      console.log(`✅ SUCCESS: ${name} is working!`);
      return true;
    } else {
      console.log(`❌ ERROR: ${name} failed`);
      if (data.error === 'Authorization header required') {
        console.log(`❌ ***REMOVED*** is NOT set in ${name}`);
      } else if (data.error === 'Invalid token') {
        console.log(`❌ ***REMOVED*** is NOT set in ${name}`);
      }
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Network error for ${name}:`, error.message);
    return false;
  }
}

async function testBothEndpoints() {
  console.log('🚀 Testing both profile endpoints with JWT...');
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
  
  console.log('🔑 ***REMOVED*** for DevOps: 4a26e4917d443a410275a40b5d007aec582a8ddbdf3d1b265f21d688fbd83c45');
  console.log('');
  
  // Test local endpoint
  const localSuccess = await testEndpoint('http://localhost:3002/api/profile', 'Local Profile Endpoint');
  
  console.log('─'.repeat(50));
  console.log('');
  
  // Test production endpoint
  const productionSuccess = await testEndpoint('https://v.dobprotocol.com/api/profile', 'Production Profile Endpoint');
  
  console.log('─'.repeat(50));
  console.log('');
  console.log('📊 SUMMARY:');
  console.log(`Local endpoint: ${localSuccess ? '✅ Working' : '❌ Failed'}`);
  console.log(`Production endpoint: ${productionSuccess ? '✅ Working' : '❌ Failed'}`);
  console.log('');
  
  if (!productionSuccess) {
    console.log('🔧 NEXT STEPS:');
    console.log('1. Contact DevOps to set ***REMOVED*** environment variable');
    console.log('2. ***REMOVED*** value: 4a26e4917d443a410275a40b5d007aec582a8ddbdf3d1b265f21d688fbd83c45');
    console.log('3. Test again once deployed');
  }
}

testBothEndpoints(); 