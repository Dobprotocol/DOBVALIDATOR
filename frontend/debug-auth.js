// Debug script to identify authentication issues
console.log('🔍 Debugging Authentication Issues...')

// Test 1: Check if JWT token is stored
function checkStoredToken() {
  console.log('1️⃣ Checking stored JWT token...')
  const authData = localStorage.getItem('authToken')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      console.log('✅ JWT Token found:', {
        token: parsed.token ? `${parsed.token.substring(0, 20)}...` : 'MISSING',
        walletAddress: parsed.walletAddress,
        expiresIn: parsed.expiresIn
      })
      return parsed.token
    } catch (error) {
      console.error('❌ Error parsing stored token:', error)
      return null
    }
  } else {
    console.log('❌ No JWT token found in localStorage')
    return null
  }
}

// Test 2: Test profile API with token
async function testProfileAPI(token) {
  console.log('2️⃣ Testing profile API with token...')
  
  try {
    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('📊 Response status:', response.status)
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))
    
    const data = await response.json()
    console.log('📊 Response data:', data)
    
    return response.status
  } catch (error) {
    console.error('❌ Profile API error:', error)
    return null
  }
}

// Test 3: Test JWT token structure
function decodeJWT(token) {
  console.log('3️⃣ Decoding JWT token...')
  
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('❌ Invalid JWT format')
      return null
    }
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]))
    console.log('✅ JWT Payload:', payload)
    
    return payload
  } catch (error) {
    console.error('❌ Error decoding JWT:', error)
    return null
  }
}

// Test 4: Test authentication flow step by step
async function testAuthFlow() {
  console.log('4️⃣ Testing complete auth flow...')
  
  try {
    // Step 1: Get challenge
    console.log('📝 Getting challenge...')
    const challengeResponse = await fetch('/api/auth/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
      })
    })
    
    const challengeData = await challengeResponse.json()
    console.log('✅ Challenge:', challengeData)
    
    // Step 2: Verify signature
    console.log('🔐 Verifying signature...')
    const verifyResponse = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN',
        signature: 'mock_signature_debug',
        challenge: challengeData.challenge
      })
    })
    
    const verifyData = await verifyResponse.json()
    console.log('✅ Verification:', verifyData)
    
    if (verifyData.token) {
      // Step 3: Test profile API
      console.log('👤 Testing profile API...')
      const profileStatus = await testProfileAPI(verifyData.token)
      console.log('✅ Profile API status:', profileStatus)
    }
    
  } catch (error) {
    console.error('❌ Auth flow error:', error)
  }
}

// Run all debug tests
async function runDebugTests() {
  console.log('🚀 Running debug tests...')
  
  // Test 1: Check stored token
  const storedToken = checkStoredToken()
  
  // Test 2: Test profile API with stored token
  if (storedToken) {
    await testProfileAPI(storedToken)
    decodeJWT(storedToken)
  }
  
  // Test 3: Test complete auth flow
  await testAuthFlow()
  
  console.log('🎯 Debug tests completed!')
}

// Export for manual testing
window.debugAuth = {
  checkStoredToken,
  testProfileAPI,
  decodeJWT,
  testAuthFlow,
  runDebugTests
}

console.log('🔍 Debug functions loaded! Use debugAuth.runDebugTests() to run all debug tests.') 