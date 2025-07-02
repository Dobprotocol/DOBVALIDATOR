const axios = require('axios');

// Configuration
const BACKEND_URL = 'https://v.dobprotocol.com';
const TEST_WALLET = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN';

async function checkProfiles() {
  console.log('🔍 Checking profiles via API...\n');
  
  try {
    // Step 1: Authenticate to get a token
    console.log('🔐 Authenticating...');
    const challengeResponse = await axios.post(`${BACKEND_URL}/api/auth/challenge`, {
      walletAddress: TEST_WALLET
    });
    
    const verifyResponse = await axios.post(`${BACKEND_URL}/api/auth/verify`, {
      walletAddress: TEST_WALLET,
      signature: 'test_signature_for_profile_check',
      challenge: challengeResponse.data.challenge
    });
    
    const token = verifyResponse.data.token;
    console.log('✅ Authentication successful');
    
    // Step 2: Get profile for the authenticated user
    console.log('\n👤 Getting profile for authenticated user...');
    const profileResponse = await axios.get(`${BACKEND_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Profile retrieved successfully');
    console.log('\n📋 Profile Details:');
    console.log(JSON.stringify(profileResponse.data, null, 2));
    
    // Step 3: Try to get some basic info about the user
    console.log('\n🔍 User information from authentication:');
    console.log(JSON.stringify(verifyResponse.data.user, null, 2));
    
    // Step 4: Check if there are any other endpoints that might give us more info
    console.log('\n🔍 Checking for additional endpoints...');
    
    // Try health endpoint
    try {
      const healthResponse = await axios.get(`${BACKEND_URL}/health`);
      console.log('✅ Health endpoint working');
    } catch (error) {
      console.log('❌ Health endpoint failed:', error.response?.status);
    }
    
    console.log('\n📝 Summary:');
    console.log('- Profile endpoint is working');
    console.log('- Authentication is working');
    console.log('- Current user has a profile');
    console.log('\n💡 To see all profiles, you would need:');
    console.log('1. Admin access to the database');
    console.log('2. Or an admin endpoint that lists all profiles');
    console.log('3. Or direct database access');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the function
checkProfiles().catch(console.error); 