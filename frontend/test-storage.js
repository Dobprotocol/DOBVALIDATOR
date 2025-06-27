// Test script to check profile storage
const fetch = require('node-fetch');

async function testProfileStorage() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing profile storage...');
  
  try {
    // Test debug endpoint
    console.log('1. Testing debug endpoint...');
    const debugResponse = await fetch(`${baseUrl}/api/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'debug' })
    });
    
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('✅ Debug data:', debugData);
    } else {
      console.log('❌ Debug request failed:', debugResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProfileStorage(); 