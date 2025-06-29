// Test script for debugging profile API locally
const API_BASE = 'http://localhost:3002/api'

async function testProfileAPI() {
  console.log('🧪 Testing Profile API locally...')
  
  try {
    // Step 1: Test authentication flow
    console.log('\n1️⃣ Testing authentication...')
    
    // Get challenge
    const challengeResponse = await fetch(`${API_BASE}/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
      })
    })
    
    const challengeData = await challengeResponse.json()
    console.log('Challenge response:', challengeData)
    
    if (!challengeData.success) {
      console.error('❌ Failed to get challenge')
      return
    }
    
    // Verify signature (using mock signature for testing)
    const verifyResponse = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN',
        signature: 'mock_signature_test',
        challenge: challengeData.challenge
      })
    })
    
    const verifyData = await verifyResponse.json()
    console.log('Verify response:', verifyData)
    
    if (!verifyData.success) {
      console.error('❌ Failed to verify signature')
      return
    }
    
    const token = verifyData.token
    console.log('✅ Got JWT token:', token ? `${token.substring(0, 50)}...` : 'none')
    
    // Step 2: Test profile GET without token
    console.log('\n2️⃣ Testing profile GET without token...')
    const profileGetNoToken = await fetch(`${API_BASE}/profile`)
    const profileGetNoTokenData = await profileGetNoToken.json()
    console.log('Profile GET (no token) response:', profileGetNoTokenData)
    
    // Step 3: Test profile GET with token
    console.log('\n3️⃣ Testing profile GET with token...')
    const profileGetResponse = await fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const profileGetData = await profileGetResponse.json()
    console.log('Profile GET (with token) response:', profileGetData)
    
    // Step 4: Test profile POST with token
    console.log('\n4️⃣ Testing profile POST with token...')
    const profilePostResponse = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test User',
        company: 'Test Company',
        email: 'test@example.com',
        phone: '+1234567890',
        website: 'https://example.com',
        bio: 'Test bio'
      })
    })
    
    const profilePostData = await profilePostResponse.json()
    console.log('Profile POST response:', profilePostData)
    
    // Step 5: Test profile GET again to see if it was created
    console.log('\n5️⃣ Testing profile GET again...')
    const profileGetAgainResponse = await fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const profileGetAgainData = await profileGetAgainResponse.json()
    console.log('Profile GET (after POST) response:', profileGetAgainData)
    
    console.log('\n✅ Test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testProfileAPI() 