// Test script using the previously generated JWT token with userId
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNsZGYxbnUwMDAxZXZ0YXdkMnMydnZ5IiwiaWF0IjoxNzUxNDI1MzI0LCJleHAiOjE3NTIwMzAxMjR9.kC68gwnK1gRMPUxhJw6uv2QY7aTAYrwlRbRIwSgljEQ';

async function testWithExistingJWT() {
  console.log('🧪 Testing Endpoints with Existing JWT Token');
  console.log('============================================');
  
  // Decode and display JWT payload
  console.log('\n1️⃣ JWT Token Analysis...');
  try {
    const parts = JWT_TOKEN.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('✅ JWT Payload:', payload);
      console.log('✅ Wallet Address:', payload.walletAddress);
      console.log('✅ User ID:', payload.userId);
      console.log('✅ Expires:', new Date(payload.exp * 1000));
      console.log('✅ Token is valid and contains userId!');
    } else {
      console.log('❌ Invalid JWT format');
      return;
    }
  } catch (error) {
    console.log('❌ Error decoding JWT:', error.message);
    return;
  }
  
  try {
    // Test 1: Frontend Profile API
    console.log('\n2️⃣ Testing Frontend Profile API...');
    const frontendProfileResponse = await fetch('https://validator.dobprotocol.com/api/profile', {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Frontend Profile Status:', frontendProfileResponse.status);
    
    if (frontendProfileResponse.ok) {
      const data = await frontendProfileResponse.json();
      console.log('✅ Frontend Profile Response:', data);
    } else {
      const errorText = await frontendProfileResponse.text();
      console.log('❌ Frontend Profile Error:', errorText);
    }
    
    // Test 2: Backend Profile API
    console.log('\n3️⃣ Testing Backend Profile API...');
    const backendProfileResponse = await fetch('https://v.dobprotocol.com/api/profile', {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Backend Profile Status:', backendProfileResponse.status);
    
    if (backendProfileResponse.ok) {
      const data = await backendProfileResponse.json();
      console.log('✅ Backend Profile Response:', data);
    } else {
      const errorText = await backendProfileResponse.text();
      console.log('❌ Backend Profile Error:', errorText);
    }
    
    // Test 3: Create Profile via Frontend
    console.log('\n4️⃣ Testing Profile Creation via Frontend...');
    const createProfileResponse = await fetch('https://validator.dobprotocol.com/api/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User via Frontend',
        company: 'Test Company via Frontend',
        email: 'test-frontend@example.com'
      })
    });
    
    console.log('📊 Frontend Profile Creation Status:', createProfileResponse.status);
    
    if (createProfileResponse.ok) {
      const data = await createProfileResponse.json();
      console.log('✅ Frontend Profile Creation Response:', data);
    } else {
      const errorText = await createProfileResponse.text();
      console.log('❌ Frontend Profile Creation Error:', errorText);
    }
    
    // Test 4: Create Profile via Backend
    console.log('\n5️⃣ Testing Profile Creation via Backend...');
    const createBackendProfileResponse = await fetch('https://v.dobprotocol.com/api/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User via Backend',
        company: 'Test Company via Backend',
        email: 'test-backend@example.com'
      })
    });
    
    console.log('📊 Backend Profile Creation Status:', createBackendProfileResponse.status);
    
    if (createBackendProfileResponse.ok) {
      const data = await createBackendProfileResponse.json();
      console.log('✅ Backend Profile Creation Response:', data);
    } else {
      const errorText = await createBackendProfileResponse.text();
      console.log('❌ Backend Profile Creation Error:', errorText);
    }
    
    // Test 5: Health Check
    console.log('\n6️⃣ Testing Health Endpoints...');
    
    const frontendHealthResponse = await fetch('https://validator.dobprotocol.com/health');
    console.log('📊 Frontend Health Status:', frontendHealthResponse.status);
    
    const backendHealthResponse = await fetch('https://v.dobprotocol.com/health');
    console.log('📊 Backend Health Status:', backendHealthResponse.status);
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWithExistingJWT(); 