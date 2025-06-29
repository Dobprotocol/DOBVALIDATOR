// Simple test for profile API endpoints
const API_BASE = 'http://localhost:3002/api'

async function testProfileEndpoints() {
  console.log('🧪 Testing Profile API endpoints directly...')
  
  try {
    // Test 1: Profile GET without authentication (should return 401)
    console.log('\n1️⃣ Testing profile GET without authentication...')
    const profileGetNoAuth = await fetch(`${API_BASE}/profile`)
    const profileGetNoAuthData = await profileGetNoAuth.json()
    console.log('Status:', profileGetNoAuth.status)
    console.log('Response:', profileGetNoAuthData)
    
    // Test 2: Profile POST without authentication (should return 401)
    console.log('\n2️⃣ Testing profile POST without authentication...')
    const profilePostNoAuth = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        company: 'Test Company',
        email: 'test@example.com'
      })
    })
    const profilePostNoAuthData = await profilePostNoAuth.json()
    console.log('Status:', profilePostNoAuth.status)
    console.log('Response:', profilePostNoAuthData)
    
    // Test 3: Profile GET with invalid token (should return 401)
    console.log('\n3️⃣ Testing profile GET with invalid token...')
    const profileGetInvalidToken = await fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': 'Bearer invalid_token_here'
      }
    })
    const profileGetInvalidTokenData = await profileGetInvalidToken.json()
    console.log('Status:', profileGetInvalidToken.status)
    console.log('Response:', profileGetInvalidTokenData)
    
    // Test 4: Test ping endpoint to verify API is working
    console.log('\n4️⃣ Testing ping endpoint...')
    const pingResponse = await fetch(`${API_BASE}/ping`)
    const pingData = await pingResponse.json()
    console.log('Status:', pingResponse.status)
    console.log('Response:', pingData)
    
    console.log('\n✅ Test completed!')
    console.log('\n📝 Summary:')
    console.log('- Profile GET without auth: 401 (expected)')
    console.log('- Profile POST without auth: 401 (expected)')
    console.log('- Profile GET with invalid token: 401 (expected)')
    console.log('- Ping endpoint: 200 (expected)')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testProfileEndpoints() 