// Simple authentication test script for Node.js
// Tests the challenge-response authentication flow

const BASE_URL = 'http://localhost:3000'

async function testAuthFlow() {
  console.log('🧪 Testing DOB Validator Authentication Flow')
  console.log('=' .repeat(50))
  
  const walletAddress = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
  
  try {
    // Step 1: Request challenge
    console.log('\n📝 Step 1: Requesting authentication challenge...')
    const challengeResponse = await fetch(`${BASE_URL}/api/auth/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress })
    })
    
    if (!challengeResponse.ok) {
      throw new Error(`Challenge request failed: ${challengeResponse.status}`)
    }
    
    const challengeData = await challengeResponse.json()
    console.log('✅ Challenge received:', challengeData)
    
    if (!challengeData.success || !challengeData.challenge) {
      throw new Error('Invalid challenge response')
    }
    
    // Step 2: Verify signature (using mock signature for testing)
    console.log('\n🔐 Step 2: Verifying signature...')
    const signature = 'mock_signature_test'
    
    const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        signature,
        challenge: challengeData.challenge
      })
    })
    
    const verifyData = await verifyResponse.json()
    console.log('📊 Verify response status:', verifyResponse.status)
    console.log('📊 Verify response data:', verifyData)
    
    if (verifyResponse.ok && verifyData.success) {
      console.log('✅ Authentication successful!')
      console.log('🎫 JWT Token received:', verifyData.token ? `${verifyData.token.substring(0, 50)}...` : 'none')
      
      // Step 3: Test protected endpoint
      console.log('\n🔒 Step 3: Testing protected endpoint...')
      const profileResponse = await fetch(`${BASE_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${verifyData.token}`
        }
      })
      
      const profileData = await profileResponse.json()
      console.log('📊 Profile response status:', profileResponse.status)
      console.log('📊 Profile response data:', profileData)
      
      if (profileResponse.ok) {
        console.log('✅ Protected endpoint access successful!')
      } else {
        console.log('❌ Protected endpoint access failed')
      }
      
    } else {
      console.log('❌ Authentication failed')
      console.log('❌ Error:', verifyData.error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('🧪 Test completed')
}

// Run the test
testAuthFlow() 