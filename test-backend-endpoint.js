// Test script to verify backend endpoint and profile API
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ0eXBlIjoidXNlciIsImlhdCI6MTc1MTQyNDQ2OSwiZXhwIjoxNzUyMDI5MjY5fQ.ovXuJ1lhKAlMINLElqJZT-7LJCsLg_mE9nXpccdLjwY';

async function testBackendEndpoint() {
  console.log('🧪 Testing backend endpoint: https://v.dobprotocol.com');
  console.log('🔑 Using JWT token:', JWT_TOKEN.substring(0, 20) + '...');
  console.log('');
  
  try {
    // Test 1: Health endpoint (correct path)
    console.log('1️⃣ Testing health endpoint (correct path)...');
    const healthResponse = await fetch('https://v.dobprotocol.com/health');
    console.log('Health Status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health Response:', healthData);
    } else {
      console.log('Health Error:', await healthResponse.text());
    }
    console.log('');
    
    // Test 2: Decode JWT token to see what's in it
    console.log('2️⃣ Decoding JWT token...');
    try {
      const parts = JWT_TOKEN.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('JWT Payload:', JSON.stringify(payload, null, 2));
        console.log('JWT Wallet Address:', payload.walletAddress);
        console.log('JWT User ID:', payload.userId);
        console.log('JWT Expires:', new Date(payload.exp * 1000));
      } else {
        console.log('❌ Invalid JWT format');
      }
    } catch (decodeError) {
      console.log('❌ Error decoding JWT:', decodeError.message);
    }
    console.log('');
    
    // Test 3: Profile endpoint with JWT token
    console.log('3️⃣ Testing profile endpoint with JWT...');
    const profileResponse = await fetch('https://v.dobprotocol.com/api/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Profile Status:', profileResponse.status);
    console.log('Profile Headers:', Object.fromEntries(profileResponse.headers.entries()));
    
    const profileData = await profileResponse.json();
    console.log('Profile Response:', JSON.stringify(profileData, null, 2));
    console.log('');
    
    // Test 4: Try to create a profile
    console.log('4️⃣ Testing profile creation...');
    const createProfileResponse = await fetch('https://v.dobprotocol.com/api/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        company: 'Test Company',
        email: 'test@example.com'
      })
    });
    
    console.log('Create Profile Status:', createProfileResponse.status);
    const createProfileData = await createProfileResponse.json();
    console.log('Create Profile Response:', JSON.stringify(createProfileData, null, 2));
    console.log('');
    
    // Test 5: Try to get profile again after creation
    console.log('5️⃣ Testing profile retrieval after creation...');
    const profileAgainResponse = await fetch('https://v.dobprotocol.com/api/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Profile Again Status:', profileAgainResponse.status);
    const profileAgainData = await profileAgainResponse.json();
    console.log('Profile Again Response:', JSON.stringify(profileAgainData, null, 2));
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testBackendEndpoint(); 