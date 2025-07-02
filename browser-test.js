// Browser Console Test Script
// Copy and paste this into the browser console at https://validator.dobprotocol.com

console.log('🧪 Starting E2E Authentication Test...');
console.log('');

// Test 1: Check localStorage before authentication
console.log('1️⃣ Checking localStorage before authentication...');
const beforeAuth = localStorage.getItem('authToken');
if (beforeAuth) {
  console.log('⚠️ Found existing auth token, clearing for clean test...');
  localStorage.removeItem('authToken');
} else {
  console.log('✅ No existing auth token found');
}
console.log('');

// Test 2: Check if wallet is connected
console.log('2️⃣ Checking wallet connection...');
const walletAddress = localStorage.getItem('stellarPublicKey');
if (walletAddress) {
  console.log('✅ Wallet connected:', walletAddress);
} else {
  console.log('❌ No wallet connected - please connect your wallet first');
  console.log('💡 Click "Connect Wallet" and authenticate with your Stellar wallet');
}
console.log('');

// Test 3: Monitor authentication process
console.log('3️⃣ Authentication monitoring...');
console.log('📝 Please complete the authentication flow now:');
console.log('   - Sign the challenge with your wallet');
console.log('   - Wait for authentication to complete');
console.log('   - Then run the next test');
console.log('');

// Test 4: Verify JWT storage (run after authentication)
function verifyJWTStorage() {
  console.log('4️⃣ Verifying JWT storage...');
  
  const authData = localStorage.getItem('authToken');
  if (!authData) {
    console.log('❌ No auth token found in localStorage');
    return false;
  }
  
  try {
    const parsed = JSON.parse(authData);
    console.log('✅ Auth token found:', {
      token: parsed.token ? `${parsed.token.substring(0, 20)}...` : 'MISSING',
      walletAddress: parsed.walletAddress,
      expiresIn: parsed.expiresIn
    });
    
    // Check if it's a real JWT
    if (parsed.token && parsed.token.startsWith('eyJ')) {
      console.log('✅ Real JWT token detected');
      
      // Decode JWT payload
      try {
        const payload = JSON.parse(atob(parsed.token.split('.')[1]));
        console.log('📄 JWT Payload:', payload);
        
        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp > now) {
          console.log('✅ JWT token is not expired');
        } else {
          console.log('❌ JWT token is expired');
        }
      } catch (e) {
        console.log('❌ Error decoding JWT payload:', e.message);
      }
    } else {
      console.log('❌ Not a real JWT token (should start with eyJ)');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error parsing auth token:', error.message);
    return false;
  }
}

// Test 5: Test profile API
async function testProfileAPI() {
  console.log('5️⃣ Testing profile API...');
  
  const authData = localStorage.getItem('authToken');
  if (!authData) {
    console.log('❌ No auth token found, cannot test API');
    return false;
  }
  
  try {
    const parsed = JSON.parse(authData);
    const token = parsed.token;
    
    console.log('🔍 Testing profile endpoint with JWT...');
    const response = await fetch('https://validator.dobprotocol.com/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Profile API successful:', data);
      return true;
    } else {
      const errorData = await response.json();
      console.log('❌ Profile API failed:', errorData);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

// Test 6: Complete E2E test
async function runCompleteTest() {
  console.log('6️⃣ Running complete E2E test...');
  console.log('');
  
  const jwtStored = verifyJWTStorage();
  if (!jwtStored) {
    console.log('❌ JWT storage test failed');
    return;
  }
  
  console.log('');
  const apiWorking = await testProfileAPI();
  
  console.log('');
  console.log('📊 E2E Test Results:');
  console.log(`✅ JWT Storage: ${jwtStored ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Profile API: ${apiWorking ? 'PASS' : 'FAIL'}`);
  
  if (jwtStored && apiWorking) {
    console.log('🎉 E2E Authentication Test PASSED!');
  } else {
    console.log('❌ E2E Authentication Test FAILED');
  }
}

// Export functions for manual testing
window.e2eTest = {
  verifyJWTStorage,
  testProfileAPI,
  runCompleteTest
};

console.log('🔧 Test functions loaded!');
console.log('📋 Available commands:');
console.log('   e2eTest.verifyJWTStorage() - Check JWT storage');
console.log('   e2eTest.testProfileAPI() - Test profile API');
console.log('   e2eTest.runCompleteTest() - Run complete E2E test');
console.log('');
console.log('💡 After authenticating, run: e2eTest.runCompleteTest()'); 