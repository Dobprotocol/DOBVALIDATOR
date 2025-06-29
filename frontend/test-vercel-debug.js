// Debug authentication flow on Vercel deployment
const VERCEL_URL = 'https://dobvalidator-frontend.vercel.app'

async function testVercelDebug() {
  console.log('🔍 Debugging Vercel authentication flow...')
  console.log('🔗 Testing URL:', VERCEL_URL)
  
  try {
    // Step 1: Test challenge generation
    console.log('\n1️⃣ Testing challenge generation...')
    const challengeResponse = await fetch(`${VERCEL_URL}/api/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3BAL3ZN' })
    })
    
    const challengeData = await challengeResponse.json()
    console.log('Challenge status:', challengeResponse.status)
    console.log('Challenge response:', challengeData)
    
    if (!challengeResponse.ok) {
      console.log('❌ Challenge generation failed')
      return
    }
    
    // Step 2: Test different mock signature formats
    console.log('\n2️⃣ Testing different mock signature formats...')
    
    const mockSignatures = [
      'mock_signature_for_testing',
      'mock_',
      'test_signature',
      'mock_signature_' + Date.now()
    ]
    
    for (const signature of mockSignatures) {
      console.log(`\n🔍 Testing signature: "${signature}"`)
      
      const walletLoginResponse = await fetch(`${VERCEL_URL}/api/auth/wallet-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3BAL3ZN',
          signature: signature,
          challenge: challengeData.challenge
        })
      })
      
      const walletLoginData = await walletLoginResponse.json()
      console.log('Status:', walletLoginResponse.status)
      console.log('Response:', walletLoginData)
      
      if (walletLoginResponse.ok) {
        console.log('✅ Mock authentication successful!')
        
        // Test profile API with the auth token
        const authToken = walletLoginData.access_token || walletLoginData.token
        console.log('\n3️⃣ Testing profile API with auth token...')
        
        const profileResponse = await fetch(`${VERCEL_URL}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        
        const profileData = await profileResponse.json()
        console.log('Profile status:', profileResponse.status)
        console.log('Profile response:', profileData)
        
        if (profileResponse.ok) {
          console.log('✅ Profile API working correctly')
        } else {
          console.log('❌ Profile API failed')
        }
        
        return // Success, exit early
      }
    }
    
    console.log('\n❌ All mock signature formats failed')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testVercelDebug() 