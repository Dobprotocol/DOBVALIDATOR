// Simple authentication test script
// Run this in the browser console to test the auth flow
// Note: Server is running on port 3000 (standard Next.js port)

const API_BASE = 'http://localhost:3000' // Standard Next.js port

async function testAuthFlow() {
  console.log('🧪 Testing authentication flow...')
  
  try {
    // Step 1: Get challenge
    console.log('📝 Step 1: Getting challenge...')
    const challengeResponse = await fetch(`${API_BASE}/api/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
      })
    })
    
    if (!challengeResponse.ok) {
      throw new Error(`Challenge failed: ${challengeResponse.status}`)
    }
    
    const challengeData = await challengeResponse.json()
    console.log('✅ Challenge received:', challengeData.challenge)
    
    // Step 2: Verify signature
    console.log('🔐 Step 2: Verifying signature...')
    const verifyResponse = await fetch(`${API_BASE}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN',
        signature: 'mock_signature_test',
        challenge: challengeData.challenge
      })
    })
    
    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => ({}))
      throw new Error(`Verification failed: ${verifyResponse.status} - ${JSON.stringify(errorData)}`)
    }
    
    const verifyData = await verifyResponse.json()
    console.log('✅ Verification successful:', verifyData.token ? 'Token received' : 'No token')
    
    // Step 3: Test profile API
    if (verifyData.token) {
      console.log('👤 Step 3: Testing profile API...')
      const profileResponse = await fetch(`${API_BASE}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${verifyData.token}`
        }
      })
      
      console.log('📊 Profile response status:', profileResponse.status)
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        console.log('✅ Profile found:', profileData)
      } else if (profileResponse.status === 404) {
        console.log('✅ Profile not found (expected for new user)')
      } else {
        console.log('❌ Profile API error:', profileResponse.status)
      }
    }
    
    console.log('🎉 Authentication flow test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Export for manual testing
window.testAuthFlow = testAuthFlow
console.log('🧪 Test function available: testAuthFlow()')
console.log('🌐 API Base URL:', API_BASE) 