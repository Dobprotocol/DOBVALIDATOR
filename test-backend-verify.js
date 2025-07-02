// Test script to verify backend /api/auth/verify endpoint
const WALLET_ADDRESS = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN';

async function testBackendVerify() {
  console.log('🧪 Testing Backend /api/auth/verify Endpoint');
  console.log('===========================================');
  
  try {
    // Step 1: Get challenge from backend
    console.log('\n1️⃣ Getting challenge from backend...');
    const challengeResponse = await fetch('https://v.dobprotocol.com/api/auth/challenge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletAddress: WALLET_ADDRESS
      })
    });
    
    if (!challengeResponse.ok) {
      console.log('❌ Challenge request failed:', challengeResponse.status);
      return;
    }
    
    const challengeData = await challengeResponse.json();
    console.log('✅ Challenge received:', challengeData);
    
    // Step 2: Create a mock signature (for testing)
    const mockSignature = 'AAAAAgAAAACCDrtJHlhuTUE4DWJCbFzmdDyRzWA4GNHAEL2cAE7CBQAAAGQAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAABoZJ3sAAAAAAAAAAEAAAAAAAAACgAAAA5hdXRoX2NoYWxsZW5nZQAAAAAAAQAAABxET0JfVkFMSURBVE9SX0FVVEhfMTc1MTQyNDQ2AAAAAAAAAAEATsIFAAAAQOPppldkuzy0Vhcs/szeTydSGFPq5ikm17m9W+oPb1pv0LupzRYnuaZ9K3Zo4/jsPbDfxe0p/1TkoPpLUOUOIQ0=';
    
    // Step 3: Verify with backend
    console.log('\n2️⃣ Verifying with backend...');
    const verifyResponse = await fetch('https://v.dobprotocol.com/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletAddress: WALLET_ADDRESS,
        signature: mockSignature,
        challenge: challengeData.challenge
      })
    });
    
    console.log('📊 Verify Status:', verifyResponse.status);
    
    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.log('❌ Verification failed:', errorText);
      return;
    }
    
    const verifyData = await verifyResponse.json();
    console.log('✅ Verification successful:', verifyData);
    
    // Step 4: Check JWT payload
    console.log('\n3️⃣ Checking JWT payload...');
    const token = verifyData.token;
    const parts = token.split('.');
    
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('✅ JWT Payload:', payload);
      
      if (payload.userId) {
        console.log('✅ JWT contains userId:', payload.userId);
      } else {
        console.log('❌ JWT missing userId!');
      }
      
      if (payload.walletAddress) {
        console.log('✅ JWT contains walletAddress:', payload.walletAddress);
      } else {
        console.log('❌ JWT missing walletAddress!');
      }
    }
    
    // Step 5: Test profile creation with the JWT
    console.log('\n4️⃣ Testing profile creation...');
    const profileResponse = await fetch('https://v.dobprotocol.com/api/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        company: 'Test Company',
        email: 'test@example.com'
      })
    });
    
    console.log('📊 Profile Creation Status:', profileResponse.status);
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile created successfully:', profileData);
    } else {
      const errorText = await profileResponse.text();
      console.log('❌ Profile creation failed:', errorText);
    }
    
    console.log('\n🎉 Backend test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBackendVerify(); 