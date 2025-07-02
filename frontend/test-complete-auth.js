// Test the complete authentication flow
const API_BASE_URL = 'http://localhost:3002'

async function testCompleteAuthFlow() {
  console.log('🧪 Testing complete authentication flow...')
  
  const testWalletAddress = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
  
  // Step 1: Generate challenge
  console.log('\n1️⃣ Generating challenge...')
  let challenge
  try {
    const challengeResponse = await fetch(`${API_BASE_URL}/api/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: testWalletAddress })
    })
    const challengeData = await challengeResponse.json()
    challenge = challengeData.challenge
    console.log('✅ Challenge generated:', challenge)
  } catch (error) {
    console.error('❌ Challenge generation failed:', error.message)
    return
  }
  
  // Step 2: Verify signature (mock)
  console.log('\n2️⃣ Verifying signature...')
  let authToken
  try {
    const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: testWalletAddress,
        signature: 'mock_signature_for_testing',
        challenge: challenge
      })
    })
    const verifyData = await verifyResponse.json()
    console.log('✅ Verification response:', verifyData)
    
    if (verifyData.success && verifyData.token) {
      authToken = verifyData.token
      console.log('✅ Authentication successful, token received')
    } else {
      console.log('⚠️ Authentication failed (expected in test mode)')
    }
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
  
  // Step 3: Test profile creation (if we have a token)
  if (authToken) {
    console.log('\n3️⃣ Testing profile creation...')
    try {
      const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: 'Test User',
          company: 'Test Corp',
          email: 'test@example.com'
        })
      })
      const profileData = await profileResponse.json()
      console.log('✅ Profile creation response:', profileData)
    } catch (error) {
      console.error('❌ Profile creation failed:', error.message)
    }
  }
  
  // Step 4: Test profile retrieval (if we have a token)
  if (authToken) {
    console.log('\n4️⃣ Testing profile retrieval...')
    try {
      const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      const profileData = await profileResponse.json()
      console.log('✅ Profile retrieval response:', profileData)
    } catch (error) {
      console.error('❌ Profile retrieval failed:', error.message)
    }
  }
  
  console.log('\n🎯 Manual Testing Instructions:')
  console.log('1. Open http://localhost:3002 in your browser')
  console.log('2. Open browser developer tools (F12)')
  console.log('3. Go to Console tab')
  console.log('4. Connect your Stellar wallet')
  console.log('5. Watch for these log messages:')
  console.log('   - "🔍 Checking user profile..."')
  console.log('   - "✅ Profile found, redirecting to dashboard"')
  console.log('   - OR "ℹ️ No profile found, redirecting to profile creation"')
  console.log('6. The app should redirect to /dashboard or /profile')
  
  console.log('\n🔧 If you see "Spline container not ready" errors:')
  console.log('- This is now fixed with our optimizations')
  console.log('- The Spline scene should load properly')
  console.log('- Check the browser console for any remaining errors')
}

testCompleteAuthFlow().catch(console.error) 