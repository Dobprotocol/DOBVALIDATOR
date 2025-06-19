// Test the authentication flow step by step
console.log('🧪 Testing Authentication Flow...')

// Step 1: Test challenge generation
async function testChallenge() {
  console.log('1️⃣ Testing challenge generation...')
  
  try {
    const response = await fetch('/api/auth/challenge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
      })
    })
    
    const data = await response.json()
    console.log('✅ Challenge response:', data)
    return data.challenge
  } catch (error) {
    console.error('❌ Challenge failed:', error)
    return null
  }
}

// Step 2: Test signature verification
async function testVerification(challenge) {
  console.log('2️⃣ Testing signature verification...')
  
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN',
        signature: 'mock_signature_test',
        challenge: challenge
      })
    })
    
    const data = await response.json()
    console.log('✅ Verification response:', data)
    return data.token
  } catch (error) {
    console.error('❌ Verification failed:', error)
    return null
  }
}

// Step 3: Test profile creation
async function testProfileCreation(token) {
  console.log('3️⃣ Testing profile creation...')
  
  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test User',
        company: 'Test Corp',
        email: 'test@example.com'
      })
    })
    
    const data = await response.json()
    console.log('✅ Profile creation response:', data)
    return true
  } catch (error) {
    console.error('❌ Profile creation failed:', error)
    return false
  }
}

// Step 4: Test profile retrieval
async function testProfileRetrieval(token) {
  console.log('4️⃣ Testing profile retrieval...')
  
  try {
    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const data = await response.json()
    console.log('✅ Profile retrieval response:', data)
    return true
  } catch (error) {
    console.error('❌ Profile retrieval failed:', error)
    return false
  }
}

// Run the complete test
async function runAuthTest() {
  console.log('🚀 Starting authentication flow test...')
  
  // Step 1: Get challenge
  const challenge = await testChallenge()
  if (!challenge) {
    console.error('❌ Test failed at challenge generation')
    return
  }
  
  // Step 2: Verify signature
  const token = await testVerification(challenge)
  if (!token) {
    console.error('❌ Test failed at signature verification')
    return
  }
  
  // Step 3: Create profile
  const profileCreated = await testProfileCreation(token)
  if (!profileCreated) {
    console.error('❌ Test failed at profile creation')
    return
  }
  
  // Step 4: Retrieve profile
  const profileRetrieved = await testProfileRetrieval(token)
  if (!profileRetrieved) {
    console.error('❌ Test failed at profile retrieval')
    return
  }
  
  console.log('🎉 All authentication tests passed!')
  console.log('✅ JWT Token:', token)
  console.log('✅ Authentication flow is working correctly')
}

// Export for manual testing
window.testAuthFlow = {
  testChallenge,
  testVerification,
  testProfileCreation,
  testProfileRetrieval,
  runAuthTest
}

console.log('🧪 Auth flow test functions loaded! Use testAuthFlow.runAuthTest() to run the complete test.') 