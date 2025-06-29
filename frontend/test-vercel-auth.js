// Test authentication flow on Vercel deployment
const VERCEL_URL = 'https://dobvalidator-frontend.vercel.app'

async function testVercelAuth() {
  console.log('🧪 Testing Vercel authentication flow...')
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
    
    // Step 2: Test wallet login with mock signature
    console.log('\n2️⃣ Testing wallet login with mock signature...')
    const walletLoginResponse = await fetch(`${VERCEL_URL}/api/auth/wallet-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3BAL3ZN',
        signature: 'mock_signature_for_testing',
        challenge: challengeData.challenge
      })
    })
    
    const walletLoginData = await walletLoginResponse.json()
    console.log('Wallet login status:', walletLoginResponse.status)
    console.log('Wallet login response:', walletLoginData)
    
    if (!walletLoginResponse.ok) {
      console.log('❌ Wallet login failed')
      return
    }
    
    // Step 3: Test profile API with the auth token
    console.log('\n3️⃣ Testing profile API with auth token...')
    const authToken = walletLoginData.access_token || walletLoginData.token
    console.log('Using auth token:', authToken ? authToken.substring(0, 20) + '...' : 'null')
    
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
    
    // Step 4: Test profile creation
    console.log('\n4️⃣ Testing profile creation...')
    const createProfileResponse = await fetch(`${VERCEL_URL}/api/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Test User',
        company: 'Test Company',
        email: 'test@example.com'
      })
    })
    
    const createProfileData = await createProfileResponse.json()
    console.log('Create profile status:', createProfileResponse.status)
    console.log('Create profile response:', createProfileData)
    
    if (createProfileResponse.ok) {
      console.log('✅ Profile creation working correctly')
    } else {
      console.log('❌ Profile creation failed')
    }
    
    console.log('\n✅ Vercel authentication test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testVercelAuth() 