// Complete flow test script - run this in browser console after authentication
console.log('🧪 Testing Complete Authentication & Profile Flow');
console.log('================================================');

// Test 1: Check if JWT token exists and has userId
function testJWTToken() {
  console.log('\n1️⃣ Testing JWT Token...');
  
  try {
    const authData = localStorage.getItem('authToken');
    if (!authData) {
      console.log('❌ No auth token found in localStorage');
      return false;
    }
    
    const parsedAuth = JSON.parse(authData);
    const token = parsedAuth.token;
    
    if (!token) {
      console.log('❌ No token in auth data');
      return false;
    }
    
    console.log('✅ Auth token found:', token.substring(0, 20) + '...');
    
    // Decode JWT payload
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ Invalid JWT format');
      return false;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    console.log('✅ JWT Payload:', payload);
    
    // Check for required fields
    if (!payload.walletAddress) {
      console.log('❌ Missing walletAddress in JWT');
      return false;
    }
    
    if (!payload.userId) {
      console.log('❌ Missing userId in JWT - this was the bug!');
      return false;
    }
    
    console.log('✅ JWT contains both walletAddress and userId!');
    console.log('✅ Wallet Address:', payload.walletAddress);
    console.log('✅ User ID:', payload.userId);
    console.log('✅ Expires:', new Date(payload.exp * 1000));
    
    return true;
  } catch (error) {
    console.error('❌ Error testing JWT:', error);
    return false;
  }
}

// Test 2: Test profile API endpoint
async function testProfileAPI() {
  console.log('\n2️⃣ Testing Profile API...');
  
  try {
    const authData = localStorage.getItem('authToken');
    if (!authData) {
      console.log('❌ No auth token found');
      return false;
    }
    
    const parsedAuth = JSON.parse(authData);
    const token = parsedAuth.token;
    
    console.log('🔍 Testing profile GET...');
    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Profile GET Status:', response.status);
    
    if (response.status === 404) {
      console.log('ℹ️ Profile not found (expected for new user)');
      return true;
    }
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Profile found:', data);
      return true;
    }
    
    if (response.status === 500) {
      const errorText = await response.text();
      console.log('❌ Profile API error:', errorText);
      return false;
    }
    
    console.log('❌ Unexpected status:', response.status);
    return false;
  } catch (error) {
    console.error('❌ Error testing profile API:', error);
    return false;
  }
}

// Test 3: Test profile creation
async function testProfileCreation() {
  console.log('\n3️⃣ Testing Profile Creation...');
  
  try {
    const authData = localStorage.getItem('authToken');
    if (!authData) {
      console.log('❌ No auth token found');
      return false;
    }
    
    const parsedAuth = JSON.parse(authData);
    const token = parsedAuth.token;
    
    const testProfile = {
      name: 'Test User',
      company: 'Test Company',
      email: 'test@example.com'
    };
    
    console.log('🔍 Creating test profile...');
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProfile)
    });
    
    console.log('📊 Profile POST Status:', response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Profile created successfully:', data);
      return true;
    }
    
    if (response.status === 500) {
      const errorText = await response.text();
      console.log('❌ Profile creation error:', errorText);
      return false;
    }
    
    console.log('❌ Unexpected status:', response.status);
    return false;
  } catch (error) {
    console.error('❌ Error testing profile creation:', error);
    return false;
  }
}

// Test 4: Test backend profile endpoint directly
async function testBackendProfile() {
  console.log('\n4️⃣ Testing Backend Profile Endpoint...');
  
  try {
    const authData = localStorage.getItem('authToken');
    if (!authData) {
      console.log('❌ No auth token found');
      return false;
    }
    
    const parsedAuth = JSON.parse(authData);
    const token = parsedAuth.token;
    
    console.log('🔍 Testing backend profile endpoint...');
    const response = await fetch('https://v.dobprotocol.com/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Backend Profile Status:', response.status);
    
    if (response.status === 404) {
      console.log('ℹ️ Backend: Profile not found (expected for new user)');
      return true;
    }
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Backend: Profile found:', data);
      return true;
    }
    
    if (response.status === 500) {
      const errorText = await response.text();
      console.log('❌ Backend: Profile API error:', errorText);
      return false;
    }
    
    console.log('❌ Backend: Unexpected status:', response.status);
    return false;
  } catch (error) {
    console.error('❌ Error testing backend profile:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Complete Flow Test...');
  
  const results = {
    jwt: testJWTToken(),
    profileAPI: await testProfileAPI(),
    profileCreation: await testProfileCreation(),
    backendProfile: await testBackendProfile()
  };
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log('JWT Token Test:', results.jwt ? '✅ PASS' : '❌ FAIL');
  console.log('Profile API Test:', results.profileAPI ? '✅ PASS' : '❌ FAIL');
  console.log('Profile Creation Test:', results.profileCreation ? '✅ PASS' : '❌ FAIL');
  console.log('Backend Profile Test:', results.backendProfile ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! The fix is working correctly!');
    console.log('✅ User creation works');
    console.log('✅ JWT contains userId');
    console.log('✅ Profile creation works');
    console.log('✅ Backend integration works');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
  
  return allPassed;
}

// Export for manual testing
window.testCompleteFlow = runAllTests;
console.log('💡 Run testCompleteFlow() to execute all tests'); 